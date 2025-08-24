// Device orientation and animation handling for Flutter Web Emulator

// Shared state to sync with main.js
const deviceState = {
  isPortrait: true // Initialize as true to match main.js
};

// Initialize device orientation and animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const deviceContainer = document.querySelector('.device-container');
  const rotateButton = document.getElementById('rotate-button');
  const deviceFrame = document.querySelector('.device-frame');

  // Verify required elements
  if (!deviceContainer) {
    console.error('Error: device-container element not found');
    return;
  }
  if (!rotateButton) {
    console.error('Error: rotate-button element not found');
    return;
  }
  if (!deviceFrame) {
    console.error('Error: device-frame element not found');
    return;
  }

  console.log('Initializing device orientation and animation handling');

  // Handle device rotation
  rotateButton.addEventListener('click', () => {
    deviceState.isPortrait = !deviceState.isPortrait;
    console.log('Rotate button clicked, new isPortrait:', deviceState.isPortrait);

    // Update orientation classes
    if (deviceState.isPortrait) {
      deviceContainer.classList.remove('landscape');
      deviceContainer.classList.add('portrait');
    } else {
      deviceContainer.classList.remove('portrait');
      deviceContainer.classList.add('landscape');
    }

    // Update dimensions
    updateDeviceDimensions();

    // Notify the extension
    vscode.postMessage({ 
      command: 'rotate', 
      isPortrait: deviceState.isPortrait
    });
  });

  // Add device tilt effect on mouse move
  deviceContainer.addEventListener('mousemove', (event) => {
    // Skip if in fullscreen mode
    if (deviceContainer.classList.contains('fullscreen')) {
      return;
    }

    const rect = deviceContainer.getBoundingClientRect();

    // Calculate mouse position relative to the center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalize distance to -1 to 1
    const distanceX = Math.min(Math.max((event.clientX - centerX) / (rect.width / 2), -1), 1);
    const distanceY = Math.min(Math.max((event.clientY - centerY) / (rect.height / 2), -1), 1);

    // Apply subtle tilt effect (max 3 degrees for smoother effect)
    const tiltX = distanceY * 3;
    const tiltY = -distanceX * 3;

    // Apply transform with perspective
    deviceContainer.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    console.log('Applying tilt effect:', { tiltX, tiltY });
  });

  // Reset tilt when mouse leaves
  deviceContainer.addEventListener('mouseleave', () => {
    deviceContainer.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    console.log('Resetting tilt effect');
  });

  // Initialize animations
  addDeviceAnimations();
});

// Update device dimensions based on orientation
function updateDeviceDimensions() {
  const deviceContainer = document.querySelector('.device-container');
  const deviceSelect = document.getElementById('device-select');

  // Verify required elements
  if (!deviceContainer) {
    console.error('Error: device-container element not found for dimension update');
    return;
  }
  if (!deviceSelect) {
    console.error('Error: device-select element not found for dimension update');
    return;
  }

  const deviceName = deviceSelect.value;
  if (!devicePresets) {
    console.error('Error: devicePresets is undefined');
    return;
  }

  const device = devicePresets[deviceName];
  if (!device) {
    console.error('Error: Device preset not found for', deviceName);
    return;
  }

  // Use deviceState.isPortrait as the source of truth
  const isPortrait = deviceState.isPortrait;

  // Update dimensions
  if (isPortrait) {
    deviceContainer.style.width = `${device.width}px`;
    deviceContainer.style.height = `${device.height}px`;
  } else {
    deviceContainer.style.width = `${device.height}px`;
    deviceContainer.style.height = `${device.width}px`;
  }

  console.log('Updated device dimensions:', {
    width: deviceContainer.style.width,
    height: deviceContainer.style.height,
    isPortrait,
    deviceName
  });
}

// Add realistic device animations
function addDeviceAnimations() {
  const deviceFrame = document.querySelector('.device-frame');
  const powerButton = document.querySelector('.power-button');

  // Verify required elements
  if (!deviceFrame) {
    console.error('Error: device-frame element not found for animations');
    return;
  }

  console.log('Initializing device animations');

  // Screen wake/sleep animation
  if (powerButton) {
    powerButton.addEventListener('click', () => {
      const deviceScreen = document.querySelector('.device-screen');
      if (!deviceScreen) {
        console.error('Error: device-screen element not found for power button animation');
        return;
      }

      console.log('Power button clicked');

      if (deviceScreen.classList.contains('screen-off')) {
        // Wake up animation
        deviceScreen.style.transition = 'background-color 0.5s ease';
        deviceScreen.classList.remove('screen-off');
        console.log('Screen waking up');

        // Add wake up flash effect
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.right = '0';
        flash.style.bottom = '0';
        flash.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        flash.style.opacity = '1';
        flash.style.transition = 'opacity 0.5s ease';
        flash.style.zIndex = '50';
        deviceScreen.appendChild(flash);

        // Fade out flash
        setTimeout(() => {
          flash.style.opacity = '0';
          setTimeout(() => {
            flash.remove();
            console.log('Wake up flash effect removed');
          }, 500);
        }, 100);
      } else {
        // Sleep animation
        deviceScreen.style.transition = 'background-color 0.3s ease';
        deviceScreen.classList.add('screen-off');
        console.log('Screen sleeping');
      }
    });
  } else {
    console.log('Note: power-button not found, skipping power button animation');
  }

  // Add button press animations
  const buttons = document.querySelectorAll('.nav-button, .power-button, .volume-up-button, .volume-down-button');
  buttons.forEach(button => {
    button.addEventListener('mousedown', () => {
      button.classList.add('button-pressed');
      console.log(`Button pressed: ${button.className}`);
    });

    button.addEventListener('mouseup', () => {
      button.classList.remove('button-pressed');
      console.log(`Button released: ${button.className}`);
    });

    button.addEventListener('mouseleave', () => {
      button.classList.remove('button-pressed');
      console.log(`Button mouseleave: ${button.className}`);
    });
  });
}