import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

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
