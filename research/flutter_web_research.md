# Flutter Web Capabilities Research

## Flutter Web Overview
- Flutter web allows running Flutter applications in a browser
- Uses HTML, CSS, and JavaScript to render Flutter UI components
- Supports most Flutter features but with some limitations

## Hot Reload Limitations
- Flutter web currently does not support traditional hot reload like mobile/desktop
- Only hot restart is officially supported, which resets app state
- Hot restart causes the app to return to the initial view/route
- This is a known limitation documented in Flutter's official documentation

## Potential Hot Reload Solutions
- Experimental hot reload support is coming in Flutter beta (3.31)
- Can be enabled with the flag `--web-experimental-hot-reload`
- For best experience in VS Code:
  - Enable hot reload on save
  - Add a web launch configuration
- Alternative approaches:
  - Use Navigator with named routes to maintain state during hot restart
  - Configure VS Code to trigger hot reload on save

## Existing Flutter Web Emulators
- "Flutter Web Emulator" extension exists in VS Code Marketplace
- Features:
  - Mobile-shaped emulator directly inside VS Code
  - Custom sizes & device presets (iPhone, Pixel, iPad)
  - Interactive controls for refresh and rotation
  - Fast preview without external browser

## Integration with VS Code
- Flutter web apps can be run within VS Code using webviews
- Communication between VS Code and Flutter web app requires custom implementation
- Need to handle URL detection and loading of Flutter web app in the emulator
