import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

// This file is the entry point for all tests
export function run() {
  // Create the mocha test suite
  describe('Flutter Web Emulator Extension Test Suite', () => {
    it('Extension should be present', () => {
      assert.ok(vscode.extensions.getExtension('flutter-web-emulator'));
    });

    it('Extension should activate', async () => {
      const extension = vscode.extensions.getExtension('flutter-web-emulator');
      if (!extension) {
        assert.fail('Extension not found');
        return;
      }
      
      await extension.activate();
      assert.ok(true, 'Extension activated');
    });

    it('Commands should be registered', async () => {
      const commands = await vscode.commands.getCommands();
      
      assert.ok(commands.includes('flutterWebEmulator.start'), 'Start command should be registered');
      assert.ok(commands.includes('flutterWebEmulator.reload'), 'Reload command should be registered');
      assert.ok(commands.includes('flutterWebEmulator.rotate'), 'Rotate command should be registered');
    });

    it('Configuration should be registered', () => {
      const config = vscode.workspace.getConfiguration('flutterWebEmulator');
      
      assert.ok(config.has('devicePresets'), 'devicePresets configuration should exist');
      assert.ok(config.has('defaultDevice'), 'defaultDevice configuration should exist');
      assert.ok(config.has('autoReload'), 'autoReload configuration should exist');
      assert.ok(config.has('experimentalHotReload'), 'experimentalHotReload configuration should exist');
      assert.ok(config.has('customFlags'), 'customFlags configuration should exist');
    });
  });
}
