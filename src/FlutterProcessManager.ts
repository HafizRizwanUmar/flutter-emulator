import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as readline from 'readline';

export class FlutterProcessManager {
  private flutterProcess: child_process.ChildProcess | undefined;
  private serverUrl: string | undefined;
  private isRunning: boolean = false;

  /**
   * Starts the Flutter web development server
   * @param useExperimentalHotReload Whether to use experimental hot reload
   * @param customFlags Additional flags for the Flutter command
   * @returns Promise that resolves to the URL of the Flutter web app
   */
  public async startFlutterWebServer(
    useExperimentalHotReload: boolean = false,
    customFlags: string[] = []
  ): Promise<string> {
    if (this.isRunning) {
      return this.serverUrl!;
    }
  
    return new Promise<string>((resolve, reject) => {
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
          reject(new Error('No workspace folder is open'));
          return;
        }
        const workspaceRoot = workspaceFolders[0].uri.fsPath;
  
        const args = ['run', '-d', 'web-server', '--web-port', '0'];
        args.push(...customFlags);
  
        console.log('Executing Flutter command:', 'flutter', args.join(' '));
        console.log('Workspace root:', workspaceRoot);
  
        this.flutterProcess = child_process.spawn('flutter', args, {
          cwd: workspaceRoot,
          shell: true,
        });
  
        console.log('Flutter process started, PID:', this.flutterProcess.pid);
        this.isRunning = true;
  
        const rl = readline.createInterface({
          input: this.flutterProcess.stdout!,
          crlfDelay: Infinity,
        });
  
        rl.on('line', (line) => {
          console.log('Flutter output:', line);
          // Robust regex to match http(s)://(localhost|127.0.0.1):<port>
          const urlMatch = line.match(/(https?:\/\/(?:localhost|127\.0\.0\.1):\d+)/i);
          if (urlMatch) {
            this.serverUrl = urlMatch[0];
            console.log('Detected server URL:', this.serverUrl);
            resolve(this.serverUrl);
          } else if (line.includes('is being served at')) {
            console.log('Potential URL line not matched:', line);
          }
        });
  
        this.flutterProcess.stderr!.on('data', (data) => {
          console.error(`Flutter process error: ${data}`);
        });
  
        this.flutterProcess.on('error', (error) => {
          this.isRunning = false;
          console.error('Flutter process error event:', error);
          reject(new Error(`Failed to start Flutter process: ${error.message}`));
        });
  
        this.flutterProcess.on('exit', (code) => {
          this.isRunning = false;
          console.log('Flutter process exited with code:', code);
          if (code !== 0) {
            reject(new Error(`Flutter process exited with code ${code}`));
          }
        });
  
        setTimeout(() => {
          if (!this.serverUrl) {
            console.error('Server URL not detected within 90 seconds');
            reject(new Error('Timeout waiting for Flutter web server URL'));
          }
        }, 90000); // Increased timeout
      } catch (error) {
        this.isRunning = false;
        console.error('startFlutterWebServer error:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
  /**
   * Stops the Flutter web development server
   */
  public stopFlutterWebServer(): void {
    if (this.flutterProcess && this.isRunning) {
      console.log('Stopping Flutter web server, PID:', this.flutterProcess.pid);
      try {
        this.flutterProcess.stdin!.write('q\n'); // Gracefully quit
        setTimeout(() => {
          if (this.flutterProcess && !this.flutterProcess.killed) {
            console.log('Forcefully terminating Flutter process, PID:', this.flutterProcess.pid);
            if (process.platform === 'win32') {
              child_process.execSync(`taskkill /pid ${this.flutterProcess.pid} /T /F`);
            } else {
              process.kill(-this.flutterProcess.pid!, 'SIGTERM');
            }
          }
        }, 2000); // Wait 2 seconds for graceful shutdown
      } catch (error) {
        console.error('Error stopping Flutter process:', error);
      }
      this.flutterProcess = undefined;
      this.serverUrl = undefined;
      this.isRunning = false;
    }
  }

  /**
   * Triggers a hot reload of the Flutter application
   */
  public triggerHotReload(): void {
    if (this.flutterProcess && this.isRunning) {
      console.log('Sending hot reload command: r');
      this.flutterProcess.stdin!.write('r\n');
    }
  }

  /**
   * Triggers a hot restart of the Flutter application
   */
  public triggerHotRestart(): void {
    if (this.flutterProcess && this.isRunning) {
      console.log('Sending hot restart command: R (caller:)', new Error().stack); // Log stack trace
      this.flutterProcess.stdin!.write('R\n');
    }
  }

  /**
   * Checks if the Flutter process is running
   */
  public isProcessRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Gets the URL of the Flutter web app
   */
  public getServerUrl(): string | undefined {
    return this.serverUrl;
  }
}
