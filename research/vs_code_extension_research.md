# VS Code Extension Development Research

## Webview API
- VS Code extensions can create fully customizable views using the Webview API
- Webviews are like iframes within VS Code that can render almost any HTML content
- Communication between extension and webview happens through message passing
- Webviews can be used in several ways:
  - As webview panels (separate editor tabs)
  - As custom editors
  - As webview views in sidebar or panel areas

## Key Webview Features
- Can render custom HTML/CSS/JS content
- Scripts are disabled by default but can be enabled with `enableScripts: true`
- Content security policy should be used to restrict script execution
- Message passing between extension and webview is done through postMessage API
- Local content loading requires special handling with vscode-resource scheme

## Extension Structure
- Extensions are defined by a `package.json` file that includes:
  - Metadata (name, description, version)
  - Activation events
  - Contribution points (commands, views, etc.)
  - Dependencies
- Main entry point is typically defined in `extension.js` or `extension.ts`
- Extensions can register commands, create UI elements, and interact with VS Code APIs

## Best Practices
- Use webviews sparingly and only when VS Code's native APIs are inadequate
- Webviews are resource-heavy and run in a separate context
- Always implement proper message passing between extension and webview
- Consider accessibility and persistence requirements
