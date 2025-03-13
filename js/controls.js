   /**
 * Creates a controls object
 * @returns {Object} A new controls object
 */
function createControls() {
    return {
        keysPressed: {},
        accelerateButtonActive: false,
        centerShip: true,
        autoZoom: true
    };
}

/**
 * Sets up event listeners for keyboard and button controls
 * @param {Object} controls - The controls object
 * @param {Object} camera - The camera object
 * @param {Function} toggleAcceleration - Function to toggle rocket acceleration
 * @param {Function} resetGame - Function to reset the game
 */
function setupEventListeners(controls, camera, toggleAcceleration, resetGame) {
    // Keyboard controls
    window.addEventListener('keydown', e => {
        controls.keysPressed[e.key] = true;
        
        // Handle toggle shortcuts
        if (e.key === 'c' || e.key === 'C') {
            controls.centerShip = !controls.centerShip;
            document.getElementById('centerShipToggle').checked = controls.centerShip;
        }
        
        if (e.key === 'a' || e.key === 'A') {
            controls.autoZoom = !controls.autoZoom;
            document.getElementById('autoZoomToggle').checked = controls.autoZoom;
            updateZoomControlsVisibility(controls.autoZoom);
        }
        
        // Handle reset shortcut
        if (e.key === 'r' || e.key === 'R') {
            resetGame();
        }
    });
    
    window.addEventListener('keyup', e => {
        controls.keysPressed[e.key] = false;
    });
    
    // Button controls
    document.getElementById('accelerateBtn').addEventListener('click', () => {
        toggleAcceleration();
    });
    
    document.getElementById('leftBtn').addEventListener('mousedown', () => {
        controls.keysPressed['ArrowLeft'] = true;
    });
    
    document.getElementById('leftBtn').addEventListener('mouseup', () => {
        controls.keysPressed['ArrowLeft'] = false;
    });
    
    document.getElementById('leftBtn').addEventListener('mouseleave', () => {
        controls.keysPressed['ArrowLeft'] = false;
    });
    
    document.getElementById('rightBtn').addEventListener('mousedown', () => {
        controls.keysPressed['ArrowRight'] = true;
    });
    
    document.getElementById('rightBtn').addEventListener('mouseup', () => {
        controls.keysPressed['ArrowRight'] = false;
    });
    
    document.getElementById('rightBtn').addEventListener('mouseleave', () => {
        controls.keysPressed['ArrowRight'] = false;
    });
    
    document.getElementById('zoomInBtn').addEventListener('click', () => {
        zoomIn(camera);
    });
    
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        zoomOut(camera);
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        resetGame();
    });
    
    // Toggle controls
    document.getElementById('centerShipToggle').addEventListener('change', (e) => {
        controls.centerShip = e.target.checked;
    });
    
    document.getElementById('autoZoomToggle').addEventListener('change', (e) => {
        controls.autoZoom = e.target.checked;
        updateZoomControlsVisibility(controls.autoZoom);
    });
    
    // Initialize zoom controls visibility
    updateZoomControlsVisibility(controls.autoZoom);
}

/**
 * Updates the visibility of zoom controls based on auto-zoom setting
 * @param {boolean} autoZoom - Whether auto-zoom is enabled
 */
function updateZoomControlsVisibility(autoZoom) {
    const zoomControls = document.getElementById('zoomControls');
    zoomControls.style.display = autoZoom ? 'none' : 'flex';
}

/**
 * Handles user input for rocket control and camera
 * @param {Object} controls - The controls object
 * @param {Object} rocket - The rocket object
 * @param {Object} camera - The camera object
 */
function handleInput(controls, rocket, camera) {
    // Handle rotation
    if (controls.keysPressed['ArrowLeft']) {
        rocket.angle -= ROTATION_RATE;
    }
    
    if (controls.keysPressed['ArrowRight']) {
        rocket.angle += ROTATION_RATE;
    }
    
    // Handle acceleration with spacebar
    if (controls.keysPressed[' '] && rocket.fuel > 0 && !rocket.exploded) {
        rocket.accelerating = true;
        document.getElementById('accelerateBtn').classList.add('active');
    } else if (controls.keysPressed[' '] === false && rocket.accelerating) {
        rocket.accelerating = false;
        document.getElementById('accelerateBtn').classList.remove('active');
    }
    
    // Handle zoom with + and - keys (only when auto-zoom is disabled)
    if (!controls.autoZoom) {
        if (controls.keysPressed['+'] || controls.keysPressed['=']) {
            zoomIn(camera);
            controls.keysPressed['+'] = false;
            controls.keysPressed['='] = false;
        }
        
        if (controls.keysPressed['-'] || controls.keysPressed['_']) {
            zoomOut(camera);
            controls.keysPressed['-'] = false;
            controls.keysPressed['_'] = false;
        }
    }
}

/**
 * Toggles the rocket's acceleration state
 * @param {Object} rocket - The rocket object
 */
function toggleAcceleration(rocket) {
    if (rocket.fuel > 0 && !rocket.exploded) {
        rocket.accelerating = !rocket.accelerating;
        document.getElementById('accelerateBtn').classList.toggle('active', rocket.accelerating);
    } else {
        rocket.accelerating = false;
        document.getElementById('accelerateBtn').classList.remove('active');
    }
}

/**
 * Updates the UI elements with game state
 * @param {Object} rocket - The rocket object
 * @param {number} orbitCount - Number of completed orbits
 */
function updateUI(rocket, orbitCount) {
    // Update fuel, altitude, and velocity displays
    document.getElementById('fuelLevel').textContent = Math.round(rocket.fuel);
    
    const altitude = Math.max(0, Math.sqrt(rocket.x * rocket.x + rocket.y * rocket.y) - 150); // 150 is EARTH_RADIUS
    document.getElementById('altitude').textContent = Math.round(altitude);
    
    const velocity = Math.sqrt(rocket.velocity.x * rocket.velocity.x + rocket.velocity.y * rocket.velocity.y);
    document.getElementById('velocity').textContent = velocity.toFixed(2);
}
