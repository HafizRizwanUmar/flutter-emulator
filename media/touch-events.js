// Touch event handling for the Flutter Web Emulator device screen

// Initialize touch events when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const deviceScreen = document.querySelector('.device-screen');
  const flutterAppFrame = document.getElementById('flutter-app');

  // Verify required elements
  if (!deviceScreen) {
    console.error('Error: device-screen element not found');
    return;
  }
  if (!flutterAppFrame) {
    console.error('Error: flutter-app iframe not found');
    return;
  }

  console.log('Initializing touch event handlers');

  // Add touch ripple effect
  deviceScreen.addEventListener('mousedown', (event) => {
    // Only trigger ripple if clicking on the screen or iframe, not buttons
    if (event.target === deviceScreen || event.target === flutterAppFrame) {
      console.log('Mousedown detected on device screen, creating ripple effect');
      createRippleEffect(event);
    }
  });

  // Add device hardware elements
  addDeviceHardwareElements();
});

// Create touch ripple effect
function createRippleEffect(event) {
  const deviceScreen = document.querySelector('.device-screen');
  const ripple = document.createElement('div');
  ripple.className = 'touch-ripple';

  // Position the ripple at the click point
  const rect = deviceScreen.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  // Add to screen
  deviceScreen.appendChild(ripple);
  console.log('Ripple effect created at:', { x, y });

  // Remove after animation completes
  setTimeout(() => {
    ripple.remove();
    console.log('Ripple effect removed');
  }, 600);
}

// Add realistic device hardware elements
function addDeviceHardwareElements() {
  const deviceFrame = document.querySelector('.device-frame');
  const deviceScreen = document.querySelector('.device-screen');

  // Verify required elements
  if (!deviceFrame) {
    console.error('Error: device-frame element not found');
    return;
  }
  if (!deviceScreen) {
    console.error('Error: device-screen element not found');
    return;
  }

  console.log('Adding device hardware elements');

  // Add device notch
  const notch = document.createElement('div');
  notch.className = 'device-notch';
  deviceFrame.appendChild(notch);

  // Add device camera
  const camera = document.createElement('div');
  camera.className = 'device-camera';
  deviceFrame.appendChild(camera);

  // Add device speaker
  const speaker = document.createElement('div');
  speaker.className = 'device-speaker';
  deviceFrame.appendChild(speaker);

  // Add home indicator for notch phones
  const homeIndicator = document.createElement('div');
  homeIndicator.className = 'home-indicator';
  deviceScreen.appendChild(homeIndicator);

  // Add corner reflections for realistic look
  const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  corners.forEach(position => {
    const reflection = document.createElement('div');
    reflection.className = `corner-reflection ${position}`;
    deviceFrame.appendChild(reflection);
  });

  // Add screen glare effect
  const glare = document.createElement('div');
  glare.className = 'screen-glare';
  deviceScreen.appendChild(glare);

  // Add fullscreen button
  const fullscreenButton = document.createElement('button');
  fullscreenButton.className = 'fullscreen-button';
  fullscreenButton.innerHTML = '⛶';
  fullscreenButton.title = 'Toggle fullscreen';
  deviceFrame.appendChild(fullscreenButton);

  // Fullscreen button functionality
  fullscreenButton.addEventListener('click', () => {
    const deviceContainer = document.querySelector('.device-container');
    if (!deviceContainer) {
      console.error('Error: device-container not found for fullscreen toggle');
      return;
    }

    deviceContainer.classList.toggle('fullscreen');
    const isFullscreen = deviceContainer.classList.contains('fullscreen');
    fullscreenButton.innerHTML = isFullscreen ? '⮌' : '⛶';
    console.log('Fullscreen toggled:', isFullscreen);

    // Notify the extension
    vscode.postMessage({ 
      command: 'fullscreenToggled', 
      isFullscreen
    });
  });
}

// Multi-touch simulation
function setupMultiTouchSimulation() {
  const deviceScreen = document.querySelector('.device-screen');
  let touchStartTime = 0;
  let lastTapTime = 0;

  // Verify required element
  if (!deviceScreen) {
    console.error('Error: device-screen element not found for multi-touch simulation');
    return;
  }

  console.log('Setting up multi-touch simulation');

  // Detect double tap
  deviceScreen.addEventListener('mousedown', (event) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - touchStartTime;
    const timeBetweenTaps = currentTime - lastTapTime;

    touchStartTime = currentTime;

    // Detect double tap (two taps within 300ms)
    if (timeBetweenTaps < 300 && tapLength < 300) {
      console.log('Double tap detected, simulating pinch-to-zoom');
      simulatePinchToZoom();
      lastTapTime = 0;
    } else {
      lastTapTime = currentTime;
    }
  });

  // Simulate pinch-to-zoom effect
  function simulatePinchToZoom() {
    const flutterAppFrame = document.getElementById('flutter-app');
    if (!flutterAppFrame) {
      console.error('Error: flutter-app iframe not found for pinch-to-zoom');
      return;
    }

    // Create zoom effect
    flutterAppFrame.style.transition = 'transform 0.3s ease';
    flutterAppFrame.style.transform = 'scale(1.2)';
    console.log('Pinch-to-zoom: scaling iframe to 1.2');

    // Reset after a short delay
    setTimeout(() => {
      flutterAppFrame.style.transform = 'scale(1)';
      console.log('Pinch-to-zoom: resetting iframe scale');
      setTimeout(() => {
        flutterAppFrame.style.transition = '';
      }, 300);
    }, 1000);

    // Notify the extension
    vscode.postMessage({ command: 'pinchToZoom' });
  }
}

// Initialize multi-touch simulation when DOM is loaded
document.addEventListener('DOMContentLoaded', setupMultiTouchSimulation);