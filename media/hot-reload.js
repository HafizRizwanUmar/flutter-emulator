// Hot reload functionality for Flutter Web Emulator

// State to manage reload animation
let isReloading = false;
let lastFileChangeTime = 0;
const FILE_CHANGE_DEBOUNCE_MS = 1000; // Debounce file changes by 1 second

// Initialize hot reload functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const reloadButton = document.getElementById('reload-button');
  const flutterAppFrame = document.getElementById('flutter-app');

  // Verify required elements
  if (!reloadButton) {
    console.error('Error: reload-button element not found');
    return;
  }
  if (!flutterAppFrame) {
    console.error('Error: flutter-app iframe not found');
    return;
  }

  console.log('Initializing hot reload functionality');

  // Add hot reload button functionality
  reloadButton.addEventListener('click', () => {
    console.log('Reload button clicked');
    triggerHotReload();
  });

  // Add keyboard shortcut for hot reload (Ctrl+R or Cmd+R)
  document.addEventListener('keydown', (event) => {
    // Check if Ctrl/Cmd+R is pressed
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      // Prevent default browser refresh
      event.preventDefault();
      console.log('Hot reload triggered via keyboard shortcut (Ctrl+R/Cmd+R)');
      reloadButton.click();
    }
  });
});

// Trigger hot reload with animation
function triggerHotReload() {
  if (isReloading) {
    console.log('Hot reload already in progress, skipping');
    return;
  }

  isReloading = true;
  showReloadAnimation();
  vscode.postMessage({ command: 'reload' });

  // Reset reloading state after animation completes
  setTimeout(() => {
    isReloading = false;
    console.log('Hot reload state reset');
  }, 2000); // Slightly longer than animation duration
}

// Create a hot reload animation
function showReloadAnimation() {
  const deviceScreen = document.querySelector('.device-screen');
  if (!deviceScreen) {
    console.error('Error: device-screen element not found for reload animation');
    isReloading = false; // Reset state on error
    return;
  }

  console.log('Showing hot reload animation');

  // Create animation container
  const animContainer = document.createElement('div');
  animContainer.className = 'reload-animation';
  animContainer.style.position = 'absolute';
  animContainer.style.top = '50%';
  animContainer.style.left = '50%';
  animContainer.style.transform = 'translate(-50%, -50%)';
  animContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  animContainer.style.borderRadius = '10px';
  animContainer.style.padding = '15px';
  animContainer.style.zIndex = '100';

  // Create spinner
  const spinner = document.createElement('div');
  spinner.className = 'reload-spinner';
  spinner.style.border = '3px solid rgba(255, 255, 255, 0.3)';
  spinner.style.borderTop = '3px solid #fff';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '30px';
  spinner.style.height = '30px';
  spinner.style.animation = 'spin 1s linear infinite';

  // Add keyframes for spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Add text
  const text = document.createElement('div');
  text.textContent = 'Hot Reloading...';
  text.style.color = 'white';
  text.style.marginTop = '10px';
  text.style.textAlign = 'center';
  text.style.fontFamily = 'sans-serif';

  // Assemble and add to DOM
  animContainer.appendChild(spinner);
  animContainer.appendChild(text);
  deviceScreen.appendChild(animContainer);

  // Remove after animation completes
  setTimeout(() => {
    animContainer.style.opacity = '0';
    animContainer.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      animContainer.remove();
      console.log('Hot reload animation removed');
    }, 500);
  }, 1500);
}

// Listen for file changes from the extension
window.addEventListener('message', event => {
  const message = event.data;
  console.log('Webview received message:', JSON.stringify(message));

  if (message.command === 'fileChanged') {
    if (!message.fileName) {
      console.error('Error: fileName missing in fileChanged message');
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastFileChangeTime < FILE_CHANGE_DEBOUNCE_MS) {
      console.log('Debouncing file change:', message.fileName);
      return;
    }
    lastFileChangeTime = currentTime;

    console.log('File changed:', message.fileName);
    // Show subtle indicator that a file has changed
    showFileChangeIndicator(message.fileName);

    // If auto-reload is enabled, trigger reload
    if (message.autoReload) {
      console.log('Auto-reload enabled, triggering reload animation');
      triggerHotReload();
    }
  }
});

// Show a subtle indicator that a file has changed
function showFileChangeIndicator(fileName) {
  const deviceScreen = document.querySelector('.device-screen');
  if (!deviceScreen) {
    console.error('Error: device-screen element not found for file change indicator');
    return;
  }

  console.log('Showing file change indicator for:', fileName);

  // Remove existing indicator if present
  const existingIndicator = document.querySelector('.file-change-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
    console.log('Removed existing file change indicator');
  }

  // Create new indicator
  const indicator = document.createElement('div');
  indicator.className = 'file-change-indicator';
  indicator.style.position = 'absolute';
  indicator.style.bottom = '60px';
  indicator.style.left = '50%';
  indicator.style.transform = 'translateX(-50%)';
  indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  indicator.style.color = 'white';
  indicator.style.borderRadius = '5px';
  indicator.style.padding = '5px 10px';
  indicator.style.fontSize = '12px';
  indicator.style.zIndex = '90';

  // Show file name
  const baseName = fileName.split(/[\\/]/).pop(); // Handle both / and \ separators
  indicator.textContent = `${baseName} changed`;

  // Add to DOM
  deviceScreen.appendChild(indicator);

  // Remove after a delay
  setTimeout(() => {
    indicator.style.opacity = '0';
    indicator.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      indicator.remove();
      console.log('File change indicator removed');
    }, 500);
  }, 3000);
}