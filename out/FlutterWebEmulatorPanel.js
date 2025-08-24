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
exports.FlutterWebEmulatorPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class FlutterWebEmulatorPanel {
    static createOrShow(extensionUri, processManager) {
        console.log('Creating or showing FlutterWebEmulatorPanel');
        // Always create in the second column for split view
        const column = vscode.ViewColumn.Two;
        if (FlutterWebEmulatorPanel.currentPanel) {
            console.log('Revealing existing panel');
            FlutterWebEmulatorPanel.currentPanel._panel.reveal(column);
            return FlutterWebEmulatorPanel.currentPanel._panel;
        }
        console.log('Creating new webview panel');
        const panel = vscode.window.createWebviewPanel(FlutterWebEmulatorPanel.viewType, 'Flutter Web Emulator', column, {
            enableScripts: true,
            localResourceRoots: [extensionUri],
            retainContextWhenHidden: true
        });
        FlutterWebEmulatorPanel.currentPanel = new FlutterWebEmulatorPanel(panel, extensionUri, processManager);
        return panel;
    }
    static reload() {
        if (FlutterWebEmulatorPanel.currentPanel) {
            FlutterWebEmulatorPanel.currentPanel._reload();
        }
    }
    static rotate() {
        if (FlutterWebEmulatorPanel.currentPanel) {
            FlutterWebEmulatorPanel.currentPanel._rotate();
        }
    }
    static dispose() {
        FlutterWebEmulatorPanel.currentPanel?.dispose();
        FlutterWebEmulatorPanel.currentPanel = undefined;
    }
    constructor(panel, extensionUri, processManager) {
        this._disposables = [];
        this._isPortrait = true;
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._processManager = processManager;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        this._panel.webview.onDidReceiveMessage(message => {
            console.log('Received message from webview:', JSON.stringify(message));
            switch (message.command) {
                case 'webviewReady':
                    console.log('Webview is ready, starting Flutter process');
                    this._startFlutterProcess();
                    return;
                case 'reload':
                    this._reload();
                    const hotReloadManager = require('./HotReloadManager').HotReloadManager.getInstance();
                    hotReloadManager.triggerHotReload();
                    return;
                case 'rotate':
                    this._rotate();
                    return;
                case 'deviceChanged':
                    vscode.window.showInformationMessage(`Device changed to ${message.device}`);
                    return;
                case 'fullscreenToggled':
                    vscode.window.showInformationMessage(`Fullscreen mode ${message.isFullscreen ? 'enabled' : 'disabled'}`);
                    return;
                default:
                    console.log('Unhandled message command:', message.command);
            }
        }, null, this._disposables);
    }
    async _startFlutterProcess() {
        try {
            const config = vscode.workspace.getConfiguration('flutterWebEmulator');
            const customFlags = config.get('customFlags', []);
            const useExperimentalHotReload = config.get('experimentalHotReload', false);
            if (useExperimentalHotReload) {
                vscode.window.showWarningMessage('The "experimentalHotReload" setting is deprecated and ignored as hot reload is enabled by default.');
            }
            vscode.window.showInformationMessage('Starting Flutter web server...');
            const url = await this._processManager.startFlutterWebServer(false, customFlags);
            console.log('Received server URL:', url);
            vscode.window.showInformationMessage(`Flutter web server started at ${url}`);
            if (this._panel) {
                console.log('Posting setAppUrl message to webview:', url);
                this._panel.webview.postMessage({ command: 'setAppUrl', url });
            }
            else {
                console.error('Webview panel not initialized');
            }
        }
        catch (error) {
            console.error('Failed to start Flutter web server:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to start Flutter web server: ${errorMessage}`);
        }
    }
    _reload() {
        console.log('Sending reload message to webview');
        this._panel.webview.postMessage({ command: 'reload' });
    }
    _rotate() {
        this._isPortrait = !this._isPortrait;
        console.log('Sending rotate message to webview, isPortrait:', this._isPortrait);
        this._panel.webview.postMessage({ command: 'rotate', isPortrait: this._isPortrait });
    }
    _update() {
        const webview = this._panel.webview;
        this._panel.title = 'Flutter Web Emulator';
        const html = this._getHtmlForWebview(webview);
        console.log('Updating webview HTML');
        webview.html = html;
    }
    _getHtmlForWebview(webview) {
        const config = vscode.workspace.getConfiguration('flutterWebEmulator');
        const defaultDeviceName = config.get('defaultDevice', 'iPhone 14');
        const devicePresets = config.get('devicePresets', {});
        const defaultDevice = devicePresets[defaultDeviceName] || { width: 390, height: 844, devicePixelRatio: 3 };
        const scriptPathOnDisk = path.join(this._extensionUri.fsPath, 'media', 'main.js');
        const scriptUri = webview.asWebviewUri(vscode.Uri.file(scriptPathOnDisk));
        const touchEventsPathOnDisk = path.join(this._extensionUri.fsPath, 'media', 'touch-events.js');
        const touchEventsUri = webview.asWebviewUri(vscode.Uri.file(touchEventsPathOnDisk));
        const deviceAnimationsPathOnDisk = path.join(this._extensionUri.fsPath, 'media', 'device-animations.js');
        const deviceAnimationsUri = webview.asWebviewUri(vscode.Uri.file(deviceAnimationsPathOnDisk));
        const hotReloadPathOnDisk = path.join(this._extensionUri.fsPath, 'media', 'hot-reload.js');
        const hotReloadUri = webview.asWebviewUri(vscode.Uri.file(hotReloadPathOnDisk));
        const stylePathOnDisk = path.join(this._extensionUri.fsPath, 'media', 'style.css');
        const styleUri = webview.asWebviewUri(vscode.Uri.file(stylePathOnDisk));
        const deviceEffectsPathOnDisk = path.join(this._extensionUri.fsPath, 'media', 'device-effects.css');
        const deviceEffectsUri = webview.asWebviewUri(vscode.Uri.file(deviceEffectsPathOnDisk));
        const nonce = getNonce();
        // Enhanced HTML with authentic emulator experience - no fullscreen button
        const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; frame-src http://localhost:* http://127.0.0.1:*;">
        <link href="${styleUri}" rel="stylesheet">
        <link href="${deviceEffectsUri}" rel="stylesheet">
        <title>Flutter Web Emulator</title>
    </head>
    <body>
        <div class="emulator-container">
            <!-- Authentic mobile device frame -->
            <div class="device-wrapper ${this._isPortrait ? 'portrait' : 'landscape'}">
                <div class="device-frame authentic-frame">
                    <!-- Device bezels and physical details -->
                    <div class="device-bezel top-bezel">
                        <div class="speaker-grille"></div>
                        <div class="front-camera"></div>
                        <div class="proximity-sensor"></div>
                    </div>
                    
                    <!-- Main screen area -->
                    <div class="device-screen authentic-screen">
                        <!-- Realistic status bar -->
                        <div class="status-bar authentic-status">
                            <div class="status-left">
                                <div class="carrier">Flutter</div>
                                <div class="signal-strength">
                                    <span class="signal-bar"></span>
                                    <span class="signal-bar"></span>
                                    <span class="signal-bar"></span>
                                    <span class="signal-bar active"></span>
                                </div>
                                <div class="wifi-icon">📶</div>
                            </div>
                            <div class="status-center">
                                <div class="status-time">12:00</div>
                            </div>
                            <div class="status-right">
                                <div class="battery-percentage">100%</div>
                                <div class="battery-icon">
                                    <div class="battery-body">
                                        <div class="battery-level"></div>
                                    </div>
                                    <div class="battery-tip"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- App content area -->
                        <div class="app-viewport">
                            <iframe id="flutter-app" src="about:blank" frameborder="0"></iframe>
                        </div>
                        
                        <!-- Home indicator (for modern devices) -->
                        <div class="home-indicator"></div>
                    </div>
                    
                    <!-- Bottom bezel -->
                    <div class="device-bezel bottom-bezel"></div>
                </div>
                
                <!-- Physical device buttons -->
                <div class="device-buttons">
                    <div class="power-button" title="Power Button"></div>
                    <div class="volume-buttons">
                        <div class="volume-up" title="Volume Up"></div>
                        <div class="volume-down" title="Volume Down"></div>
                    </div>
                </div>
            </div>
            
            <!-- Developer controls (minimal and contextual) -->
            <div class="dev-controls" style="display: none;">
                <select id="device-select" title="Device Model">
                    ${Object.keys(devicePresets).map(device => `<option value="${device}" ${device === defaultDeviceName ? 'selected' : ''}>${device}</option>`).join('')}
                </select>
                <button id="reload-btn" title="Hot Reload (Ctrl+R)">⟳</button>
                <button id="rotate-btn" title="Rotate (Ctrl+Shift+R)">↻</button>
            </div>
            
            <!-- Keyboard shortcuts overlay -->
            <div class="shortcuts-overlay">
                <div class="shortcut-hint">Ctrl+R: Reload • Ctrl+Shift+R: Rotate</div>
            </div>
        </div>
        
        <script nonce="${nonce}">
            const devicePresets = ${JSON.stringify(devicePresets)};
            const isPortrait = ${this._isPortrait};
            let currentDevice = devicePresets['${defaultDeviceName}'];
            let flutterAppUrl = '';
            const vscode = acquireVsCodeApi();
            
            // Enhanced emulator configuration
            const emulatorConfig = {
                authenticLook: true,
                showPhysicalButtons: true,
                realisticStatusBar: true,
                smoothAnimations: true,
                touchFeedback: true
            };
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        <script nonce="${nonce}" src="${touchEventsUri}"></script>
        <script nonce="${nonce}" src="${deviceAnimationsUri}"></script>
        <script nonce="${nonce}" src="${hotReloadUri}"></script>
    </body>
    </html>`;
        console.log('Generated enhanced webview HTML');
        return html;
    }
    dispose() {
        console.log('Disposing FlutterWebEmulatorPanel');
        this._processManager.stopFlutterWebServer();
        FlutterWebEmulatorPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.FlutterWebEmulatorPanel = FlutterWebEmulatorPanel;
FlutterWebEmulatorPanel.viewType = 'flutterWebEmulator';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=FlutterWebEmulatorPanel.js.map