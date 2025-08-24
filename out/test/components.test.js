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
const FlutterProcessManager_1 = require("../FlutterProcessManager");
const HotReloadManager_1 = require("../HotReloadManager");
suite('Flutter Process Manager Test Suite', () => {
    test('Process Manager should be instantiable', () => {
        const processManager = new FlutterProcessManager_1.FlutterProcessManager();
        assert.ok(processManager, 'Process Manager should be created');
    });
    test('Process Manager should have required methods', () => {
        const processManager = new FlutterProcessManager_1.FlutterProcessManager();
        assert.strictEqual(typeof processManager.startFlutterWebServer, 'function', 'startFlutterWebServer should be a function');
        assert.strictEqual(typeof processManager.stopFlutterWebServer, 'function', 'stopFlutterWebServer should be a function');
        assert.strictEqual(typeof processManager.triggerHotReload, 'function', 'triggerHotReload should be a function');
        assert.strictEqual(typeof processManager.triggerHotRestart, 'function', 'triggerHotRestart should be a function');
        assert.strictEqual(typeof processManager.isProcessRunning, 'function', 'isProcessRunning should be a function');
        assert.strictEqual(typeof processManager.getServerUrl, 'function', 'getServerUrl should be a function');
    });
});
suite('Hot Reload Manager Test Suite', () => {
    test('Hot Reload Manager should be a singleton', () => {
        const instance1 = HotReloadManager_1.HotReloadManager.getInstance();
        const instance2 = HotReloadManager_1.HotReloadManager.getInstance();
        assert.strictEqual(instance1, instance2, 'Multiple calls to getInstance should return the same instance');
    });
    test('Hot Reload Manager should have required methods', () => {
        const hotReloadManager = HotReloadManager_1.HotReloadManager.getInstance();
        assert.strictEqual(typeof hotReloadManager.initialize, 'function', 'initialize should be a function');
        assert.strictEqual(typeof hotReloadManager.triggerHotReload, 'function', 'triggerHotReload should be a function');
        assert.strictEqual(typeof hotReloadManager.triggerHotRestart, 'function', 'triggerHotRestart should be a function');
        assert.strictEqual(typeof hotReloadManager.setAutoReloadEnabled, 'function', 'setAutoReloadEnabled should be a function');
        assert.strictEqual(typeof hotReloadManager.dispose, 'function', 'dispose should be a function');
    });
});
//# sourceMappingURL=components.test.js.map