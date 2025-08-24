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
exports.generateTestReport = generateTestReport;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Manual testing checklist for Flutter Web Emulator
// This file provides a structured approach to manually test the extension functionality
const manualTests = [
    {
        name: 'Extension Installation',
        steps: [
            'Install the extension from VSIX package',
            'Verify extension appears in the extensions list',
            'Verify extension activates when a Flutter project is opened'
        ]
    },
    {
        name: 'Emulator Launch',
        steps: [
            'Open a Flutter project with web support',
            'Run the "Flutter Web Emulator: Start" command from command palette',
            'Verify emulator panel opens',
            'Verify Flutter web server starts',
            'Verify Flutter app loads in the emulator'
        ]
    },
    {
        name: 'Device UI',
        steps: [
            'Verify device frame appears with proper styling',
            'Verify status bar is visible with time and icons',
            'Verify navigation buttons (back, home, recent) are visible',
            'Verify device hardware buttons (power, volume) are visible',
            'Verify device notch and camera elements are visible'
        ]
    },
    {
        name: 'Device Interaction',
        steps: [
            'Test clicking on the screen (should show ripple effect)',
            'Test home button (should trigger home action)',
            'Test back button (should trigger back action)',
            'Test recent apps button (should trigger recent apps action)',
            'Test power button (should toggle screen on/off)',
            'Test volume buttons (should show volume indicator)'
        ]
    },
    {
        name: 'Device Controls',
        steps: [
            'Test device rotation button (should rotate device between portrait and landscape)',
            'Test device selection dropdown (should change device dimensions)',
            'Test reload button (should trigger hot reload)',
            'Test fullscreen button (should toggle fullscreen mode)'
        ]
    },
    {
        name: 'Hot Reload Functionality',
        steps: [
            'Make a change to a Flutter Dart file',
            'Save the file',
            'Verify hot reload is triggered automatically',
            'Verify reload animation appears',
            'Verify changes appear in the emulator',
            'Test manual reload using the reload button',
            'Test keyboard shortcut (Ctrl+R or Cmd+R) for hot reload'
        ]
    },
    {
        name: 'Configuration',
        steps: [
            'Open VS Code settings',
            'Verify Flutter Web Emulator settings are available',
            'Change default device setting and verify it takes effect',
            'Toggle auto reload setting and verify it takes effect',
            'Toggle experimental hot reload setting and verify it takes effect'
        ]
    },
    {
        name: 'Edge Cases',
        steps: [
            'Test with a Flutter project that does not have web support',
            'Test with no Flutter project open',
            'Test with Flutter not installed',
            'Test closing and reopening the emulator panel',
            'Test with multiple emulator panels open'
        ]
    }
];
// Export the test cases for documentation
function generateTestReport() {
    let report = '# Flutter Web Emulator Manual Test Report\n\n';
    manualTests.forEach(test => {
        report += `## ${test.name}\n\n`;
        test.steps.forEach((step, index) => {
            report += `${index + 1}. [ ] ${step}\n`;
        });
        report += '\n';
    });
    return report;
}
// If this script is run directly, generate and save the report
if (require.main === module) {
    const report = generateTestReport();
    const reportPath = path.join(__dirname, 'manual-test-checklist.md');
    fs.writeFileSync(reportPath, report);
    console.log(`Manual test checklist saved to ${reportPath}`);
}
//# sourceMappingURL=manual-tests.js.map