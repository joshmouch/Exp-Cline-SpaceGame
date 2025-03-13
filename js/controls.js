/**
 * Creates a controls object
 * @returns {Object} A new controls object
 */
function createControls() {
    return {
        keysPressed: {},
        accelerateButtonActive: false
    };
}

/**
 * Sets up event listeners for keyboard and button controls
 * @param {Object} controls - The controls object
 * @param {Object} camera - The camera object
 * @param {Function} toggleAcceleration - Function to toggle rocket acceleration
 */
function setupEventListeners(controls, camera, toggleAcceleration) {
    // Keyboard controls
    window.addEventListener('keydown', e => {
        controls.keysPressed[e.key] = true;
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
}

/**
 * Handles user input for rocket control
 * @param {Object} controls - The controls object
 * @param {Object} rocket - The rocket object
 * @param {Function} toggleAcceleration - Function to toggle rocket acceleration
 */
function handleInput(controls, rocket) {
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
