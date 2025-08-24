import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class HotReloadManager {
  private static instance: HotReloadManager;
  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private debounceTimer: NodeJS.Timeout | undefined;
  private typingTimer: NodeJS.Timeout | undefined;
  private panel: vscode.WebviewPanel | undefined;
  private processManager: any; // FlutterProcessManager
  private isEnabled: boolean = true;
  private debounceDelay: number = 2000; // ms - increased for better typing experience
  private typingDetectionDelay: number = 1500; // ms - delay to detect if user is still typing
  private isUserTyping: boolean = false;
  private lastChangeTime: number = 0;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): HotReloadManager {
    if (!HotReloadManager.instance) {
      HotReloadManager.instance = new HotReloadManager();
    }
    return HotReloadManager.instance;
  }

  /**
   * Initialize the hot reload manager
   * @param panel The webview panel to send messages to
   * @param processManager The Flutter process manager to trigger hot reload
   */
  public initialize(panel: vscode.WebviewPanel, processManager: any): void {
    this.panel = panel;
    this.processManager = processManager;
    
    // Get configuration
    const config = vscode.workspace.getConfiguration('flutterWebEmulator');
    this.isEnabled = config.get<boolean>('autoReload', true);
    
    // Setup file watcher
    this.setupFileWatcher();
    
    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('flutterWebEmulator.autoReload')) {
        const config = vscode.workspace.getConfiguration('flutterWebEmulator');
        this.isEnabled = config.get<boolean>('autoReload', true);
      }
    });
  }

  /**
   * Setup file watcher to detect changes in Flutter project files
   */
  private setupFileWatcher(): void {
    // Dispose existing watcher if any
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    
    // Get workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }
    
    // Create file watcher for Dart files
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(workspaceRoot, '**/*.dart')
    );
    
    // Watch for file changes
    this.fileWatcher.onDidChange(uri => this.handleFileChange(uri));
    this.fileWatcher.onDidCreate(uri => this.handleFileChange(uri));
    this.fileWatcher.onDidDelete(uri => this.handleFileChange(uri));
  }

  /**
   * Handle file changes with enhanced debouncing and typing detection
   * @param uri The URI of the changed file
   */
  private handleFileChange(uri: vscode.Uri): void {
    const currentTime = Date.now();
    this.lastChangeTime = currentTime;
    
    // Mark user as typing
    this.isUserTyping = true;
    
    // Clear existing timers
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    
    // Set typing detection timer
    this.typingTimer = setTimeout(() => {
      this.isUserTyping = false;
    }, this.typingDetectionDelay);
  
    // Enhanced debounce timer with typing detection
    this.debounceTimer = setTimeout(() => {
      // Only proceed if user has stopped typing
      if (this.isUserTyping || (Date.now() - this.lastChangeTime) < this.typingDetectionDelay) {
        console.log('User is still typing, delaying hot reload...');
        // Reschedule with additional delay
        this.handleFileChange(uri);
        return;
      }
      
      if (!this.isEnabled) {
        return;
      }
  
      const workspaceFolders = vscode.workspace.workspaceFolders;
      let relativePath = uri.fsPath;
  
      if (workspaceFolders) {
        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        relativePath = path.relative(workspaceRoot, uri.fsPath);
      }
  
      // Ignore files in .dart_tool
      if (relativePath.startsWith('.dart_tool') || !relativePath.endsWith('.dart')) {
        console.log('Ignoring file change:', relativePath);
        return;
      }
  
      console.log('File changed and user finished typing:', relativePath);
  
      if (this.panel) {
        this.panel.webview.postMessage({ 
          command: 'fileChanged', 
          fileName: relativePath,
          autoReload: this.isEnabled
        });
      }
  
      if (this.processManager) {
        console.log('Triggering hot reload for:', relativePath);
        this.processManager.triggerHotReload();
      }
    }, this.debounceDelay);
  }
  /**
   * Manually trigger hot reload
   */
  public triggerHotReload(): void {
    console.log('Triggering hot restart');
    if (this.processManager) {
      this.processManager.triggerHotReload();
    }
  }

  /**
   * Manually trigger hot restart
   */
  public triggerHotRestart(): void {
    console.log('Triggering hot restart');
    if (this.processManager) {
      this.processManager.triggerHotRestart();
    }
  }

  /**
   * Enable or disable auto reload
   * @param enabled Whether auto reload should be enabled
   */
  public setAutoReloadEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    // Update configuration
    const config = vscode.workspace.getConfiguration('flutterWebEmulator');
    config.update('autoReload', enabled, vscode.ConfigurationTarget.Global);
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }
}
