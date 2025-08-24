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
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
suite('Flutter Web Emulator Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting Flutter Web Emulator tests');
    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('flutter-web-emulator'));
    });
    test('Extension should activate', async () => {
        const extension = vscode.extensions.getExtension('flutter-web-emulator');
        if (!extension) {
            assert.fail('Extension not found');
            return;
        }
        await extension.activate();
        assert.ok(true, 'Extension activated');
    });
    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('flutterWebEmulator.start'), 'Start command should be registered');
        assert.ok(commands.includes('flutterWebEmulator.reload'), 'Reload command should be registered');
        assert.ok(commands.includes('flutterWebEmulator.rotate'), 'Rotate command should be registered');
    });
    test('Configuration should be registered', () => {
        const config = vscode.workspace.getConfiguration('flutterWebEmulator');
        assert.ok(config.has('devicePresets'), 'devicePresets configuration should exist');
        assert.ok(config.has('defaultDevice'), 'defaultDevice configuration should exist');
        assert.ok(config.has('autoReload'), 'autoReload configuration should exist');
        assert.ok(config.has('experimentalHotReload'), 'experimentalHotReload configuration should exist');
        assert.ok(config.has('customFlags'), 'customFlags configuration should exist');
    });
});
//# sourceMappingURL=extension.test.js.map