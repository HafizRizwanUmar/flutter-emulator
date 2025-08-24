import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { FlutterProcessManager } from '../FlutterProcessManager';
import { HotReloadManager } from '../HotReloadManager';

suite('Flutter Process Manager Test Suite', () => {
  test('Process Manager should be instantiable', () => {
    const processManager = new FlutterProcessManager();
    assert.ok(processManager, 'Process Manager should be created');
  });

  test('Process Manager should have required methods', () => {
    const processManager = new FlutterProcessManager();
    
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
    const instance1 = HotReloadManager.getInstance();
    const instance2 = HotReloadManager.getInstance();
    
    assert.strictEqual(instance1, instance2, 'Multiple calls to getInstance should return the same instance');
  });

  test('Hot Reload Manager should have required methods', () => {
    const hotReloadManager = HotReloadManager.getInstance();
    
    assert.strictEqual(typeof hotReloadManager.initialize, 'function', 'initialize should be a function');
    assert.strictEqual(typeof hotReloadManager.triggerHotReload, 'function', 'triggerHotReload should be a function');
    assert.strictEqual(typeof hotReloadManager.triggerHotRestart, 'function', 'triggerHotRestart should be a function');
    assert.strictEqual(typeof hotReloadManager.setAutoReloadEnabled, 'function', 'setAutoReloadEnabled should be a function');
    assert.strictEqual(typeof hotReloadManager.dispose, 'function', 'dispose should be a function');
  });
});
