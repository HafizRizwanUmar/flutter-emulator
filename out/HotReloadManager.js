"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotReloadManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class HotReloadManager {
    constructor() {
        this.isEnabled = true;
        this.debounceDelay = 2000; // ms - increased for better typing experience
        this.typingDetectionDelay = 1500; // ms - delay to detect if user is still typing
        this.isUserTyping = false;
        this.lastChangeTime = 0;
        // Private constructor for singleton pattern
    }
    static getInstance() {
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
    initialize(panel, processManager) {
        this.panel = panel;
        this.processManager = processManager;
        // Get configuration
        const config = vscode.workspace.getConfiguration('flutterWebEmulator');
        this.isEnabled = config.get('autoReload', true);
        // Setup file watcher
        this.setupFileWatcher();
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('flutterWebEmulator.autoReload')) {
                const config = vscode.workspace.getConfiguration('flutterWebEmulator');
                this.isEnabled = config.get('autoReload', true);
            }
        });
    }
    /**
     * Setup file watcher to detect changes in Flutter project files
     */
    setupFileWatcher() {
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
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspaceRoot, '**/*.dart'));
        // Watch for file changes
        this.fileWatcher.onDidChange(uri => this.handleFileChange(uri));
        this.fileWatcher.onDidCreate(uri => this.handleFileChange(uri));
        this.fileWatcher.onDidDelete(uri => this.handleFileChange(uri));
    }
    /**
     * Handle file changes with enhanced debouncing and typing detection
     * @param uri The URI of the changed file
     */
    handleFileChange(uri) {
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
    triggerHotReload() {
        console.log('Triggering hot restart');
        if (this.processManager) {
            this.processManager.triggerHotReload();
        }
    }
    /**
     * Manually trigger hot restart
     */
    triggerHotRestart() {
        console.log('Triggering hot restart');
        if (this.processManager) {
            this.processManager.triggerHotRestart();
        }
    }
    /**
     * Enable or disable auto reload
     * @param enabled Whether auto reload should be enabled
     */
    setAutoReloadEnabled(enabled) {
        this.isEnabled = enabled;
        // Update configuration
        const config = vscode.workspace.getConfiguration('flutterWebEmulator');
        config.update('autoReload', enabled, vscode.ConfigurationTarget.Global);
    }
    /**
     * Dispose resources
     */
    dispose() {
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
exports.HotReloadManager = HotReloadManager;
//# sourceMappingURL=HotReloadManager.js.map