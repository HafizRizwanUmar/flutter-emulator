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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const FlutterWebEmulatorPanel_1 = require("./FlutterWebEmulatorPanel");
const FlutterProcessManager_1 = require("./FlutterProcessManager");
const HotReloadManager_1 = require("./HotReloadManager");
const WEBSITE_URL = 'https://flutter-web-emulator.vercel.app';
const THANKS_PAGE_URL = `${WEBSITE_URL}/thanks`;
function activate(context) {
    console.log('Flutter Web Emulator extension is now active');
    // Check if this is the first time the extension is activated
    const isFirstActivation = context.globalState.get('flutter-web-emulator.firstActivation', true);
    if (isFirstActivation) {
        // Show thanks page on first activation
        showThanksPage();
        // Mark as no longer first activation
        context.globalState.update('flutter-web-emulator.firstActivation', false);
    }
    // Create process manager with performance optimizations
    const processManager = new FlutterProcessManager_1.FlutterProcessManager();
    // Create hot reload manager
    const hotReloadManager = HotReloadManager_1.HotReloadManager.getInstance();
    // Create status bar item for play button
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(play) Flutter Emulator";
    statusBarItem.tooltip = "Start Flutter Web Emulator";
    statusBarItem.command = "flutterWebEmulator.start";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Register commands
    const startCommand = vscode.commands.registerCommand('flutterWebEmulator.start', async () => {
        // Automatically open the website in Chrome when starting the emulator
        await openWebsiteInChrome();
        // Create the emulator panel with split view
        const panel = FlutterWebEmulatorPanel_1.FlutterWebEmulatorPanel.createOrShow(context.extensionUri, processManager);
        // Configure split view for better development experience
        if (panel) {
            // Move the panel to the side for split view
            await vscode.commands.executeCommand('workbench.action.moveEditorToRightGroup');
            // Initialize hot reload manager with the panel and process manager
            hotReloadManager.initialize(panel, processManager);
            // Show information about the enhanced experience
            vscode.window.showInformationMessage('🚀 Enhanced Flutter Web Emulator started! Website opened in Chrome and VS Code is now in split view for optimal development experience.', 'Got it!');
        }
    });
    const reloadCommand = vscode.commands.registerCommand('flutterWebEmulator.reload', () => {
        console.log('Executing reload command');
        FlutterWebEmulatorPanel_1.FlutterWebEmulatorPanel.reload();
        hotReloadManager.triggerHotReload(); // Ensure hot reload
    });
    const rotateCommand = vscode.commands.registerCommand('flutterWebEmulator.rotate', () => {
        FlutterWebEmulatorPanel_1.FlutterWebEmulatorPanel.rotate();
    });
    // Add command to show thanks page
    const thanksCommand = vscode.commands.registerCommand('flutterWebEmulator.showThanks', () => {
        showThanksPage();
    });
    // Enhanced command to open website with Chrome preference
    const websiteCommand = vscode.commands.registerCommand('flutterWebEmulator.openWebsite', () => {
        openWebsiteInChrome();
    });
    // Add commands to subscriptions
    context.subscriptions.push(startCommand);
    context.subscriptions.push(reloadCommand);
    context.subscriptions.push(rotateCommand);
    context.subscriptions.push(thanksCommand);
    context.subscriptions.push(websiteCommand);
    // Performance optimization: Preload resources
    preloadResources(context);
}
async function openWebsiteInChrome() {
    try {
        // Try to open in Chrome specifically
        const terminal = vscode.window.createTerminal('Flutter Web Emulator - Chrome');
        // Detect OS and use appropriate Chrome command
        const platform = process.platform;
        let chromeCommand = '';
        if (platform === 'win32') {
            chromeCommand = `start chrome "${WEBSITE_URL}"`;
        }
        else if (platform === 'darwin') {
            chromeCommand = `open -a "Google Chrome" "${WEBSITE_URL}"`;
        }
        else {
            // Linux and others
            chromeCommand = `google-chrome "${WEBSITE_URL}" || chromium-browser "${WEBSITE_URL}" || xdg-open "${WEBSITE_URL}"`;
        }
        terminal.sendText(chromeCommand);
        terminal.hide(); // Hide terminal after execution
        console.log('Website opened in Chrome');
    }
    catch (error) {
        console.error('Failed to open website in Chrome, falling back to default browser:', error);
        // Fallback to default browser
        vscode.env.openExternal(vscode.Uri.parse(WEBSITE_URL));
    }
}
function preloadResources(context) {
    // Preload commonly used resources for better performance
    const resourcePaths = [
        'media/main.js',
        'media/style.css',
        'media/device-effects.css',
        'media/touch-events.js',
        'media/device-animations.js',
        'media/hot-reload.js'
    ];
    // Cache resource URIs for faster access
    resourcePaths.forEach(resourcePath => {
        const resourceUri = vscode.Uri.joinPath(context.extensionUri, resourcePath);
        // Store in context for quick access
        context.globalState.update(`cached-${resourcePath}`, resourceUri.toString());
    });
}
function showThanksPage() {
    // Show a welcome message with options
    vscode.window.showInformationMessage('🎉 Thank you for installing Flutter Web Emulator! Welcome to our community of 50,000+ developers.', 'View Thanks Page', 'Get Started', 'Later').then(selection => {
        if (selection === 'View Thanks Page') {
            openWebsiteInChrome();
        }
        else if (selection === 'Get Started') {
            // Show quick start guide
            vscode.window.showInformationMessage('🚀 Quick Start: Press Ctrl+Shift+P and search for "Flutter Web Emulator: Start" to begin!', 'Open Thanks Page').then(choice => {
                if (choice === 'Open Thanks Page') {
                    openWebsiteInChrome();
                }
            });
        }
    });
}
function deactivate() {
    console.log('Deactivating Flutter Web Emulator extension');
    try {
        FlutterWebEmulatorPanel_1.FlutterWebEmulatorPanel.dispose();
        HotReloadManager_1.HotReloadManager.getInstance().dispose();
    }
    catch (error) {
        console.error('Error during extension deactivation:', error);
    }
}
//# sourceMappingURL=extension.js.map