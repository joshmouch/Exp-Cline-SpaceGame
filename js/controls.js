/**
 * Creates a controls object
 * @returns {Object} A new controls object
 */
function createControls() {
    return {
        keysPressed: {},
        accelerateButtonActive: false,
        focus: 'ship', // Start with ship focus
        isDragging: false,
        lastMousePos: { x: 0, y: 0 },
        lastFocusChange: 0 // Track last focus change time
    };
}

/**
 * Sets up event listeners for keyboard and button controls
 * @param {Object} controls - The controls object
 * @param {Object} camera - The camera object
 * @param {Function} accelerateCallback - Function to handle acceleration
 * @param {Function} resetGame - Function to reset the game
 */
function setupEventListeners(controls, camera, accelerateCallback, resetGame) {
    const canvas = document.getElementById('gameCanvas');
    
    // Keyboard controls
    window.addEventListener('keydown', e => {
        // Only set key state if it wasn't already pressed (prevents key repeat)
        if (!controls.keysPressed[e.key]) {
            controls.keysPressed[e.key] = true;
        }
        
        // Handle reset shortcut
        if (e.key === 'r' || e.key === 'R') {
            resetGame();
        }
    });
    
    window.addEventListener('keyup', e => {
        controls.keysPressed[e.key] = false;
    });
    
    // Mouse controls for camera
    canvas.addEventListener('mousedown', e => {
        controls.isDragging = true;
        controls.lastMousePos = { x: e.clientX, y: e.clientY };
    });
    
    window.addEventListener('mousemove', e => {
        if (controls.isDragging) {
            const dx = e.clientX - controls.lastMousePos.x;
            const dy = e.clientY - controls.lastMousePos.y;
            
            // Move camera in opposite direction of mouse movement
            camera.x -= dx / camera.zoom;
            camera.y -= dy / camera.zoom;
            
            controls.lastMousePos = { x: e.clientX, y: e.clientY };
            
            // Set focus to manual when dragging
            controls.focus = 'manual';
            document.getElementById('focusSelect').value = 'manual';
        }
    });
    
    window.addEventListener('mouseup', () => {
        controls.isDragging = false;
    });
    
    window.addEventListener('mouseleave', () => {
        controls.isDragging = false;
    });
    
    // Mouse wheel for zoom
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        if (e.deltaY < 0) {
            // Zoom in
            zoomIn(camera);
        } else {
            // Zoom out
            zoomOut(camera);
        }
    });
    
    // Button controls
    document.getElementById('accelerateBtn').addEventListener('click', () => {
        accelerateCallback(true, true); // true, true = state, isToggle
    });
    
    document.getElementById('leftBtn').addEventListener('mousedown', () => {
        controls.keysPressed['a'] = true;
    });
    
    document.getElementById('leftBtn').addEventListener('mouseup', () => {
        controls.keysPressed['a'] = false;
    });
    
    document.getElementById('leftBtn').addEventListener('mouseleave', () => {
        controls.keysPressed['a'] = false;
    });
    
    document.getElementById('rightBtn').addEventListener('mousedown', () => {
        controls.keysPressed['d'] = true;
    });
    
    document.getElementById('rightBtn').addEventListener('mouseup', () => {
        controls.keysPressed['d'] = false;
    });
    
    document.getElementById('rightBtn').addEventListener('mouseleave', () => {
        controls.keysPressed['d'] = false;
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
    
    // Focus dropdown
    document.getElementById('focusSelect').addEventListener('change', (e) => {
        controls.focus = e.target.value;
    });
    
    // Always show zoom controls
    document.getElementById('zoomControls').style.display = 'flex';
}

/**
 * Cycles to the next focus option
 * @param {Object} controls - The controls object
 */
function cycleFocus(controls) {
    const focusSelect = document.getElementById('focusSelect');
    const options = Array.from(focusSelect.options);
    const currentIndex = options.findIndex(option => option.value === controls.focus);
    const nextIndex = (currentIndex + 1) % options.length;
    
    controls.focus = options[nextIndex].value;
    focusSelect.value = controls.focus;
}

/**
 * Handles user input for rocket control and camera
 * @param {Object} controls - The controls object
 * @param {Object} rocket - The rocket object
 * @param {Object} camera - The camera object
 */
function handleInput(controls, rocket, camera) {
    const currentTime = Date.now();
    
    // Handle rotation with A and D keys - only if not landed
    if (!rocket.landed && !rocket.exploded) {
        if (controls.keysPressed['a'] || controls.keysPressed['A']) {
            rocket.angle -= ROTATION_RATE;
            console.log(`Rotating left, new angle: ${rocket.angle.toFixed(2)}`);
        }
        
        if (controls.keysPressed['d'] || controls.keysPressed['D']) {
            rocket.angle += ROTATION_RATE;
            console.log(`Rotating right, new angle: ${rocket.angle.toFixed(2)}`);
        }
    }
    
    // Handle acceleration with W key - only if not already accelerating from button
    if (!controls.accelerateButtonActive) {
        if (controls.keysPressed['w'] || controls.keysPressed['W']) {
            setAcceleration(rocket, true);
        } else {
            setAcceleration(rocket, false);
        }
    }
    
    // Handle focus cycling with F key
    if ((controls.keysPressed['f'] || controls.keysPressed['F']) && 
        currentTime - controls.lastFocusChange > 200) { // 200ms delay between focus changes
        cycleFocus(controls);
        controls.lastFocusChange = currentTime;
    }
    
    // Handle zoom with + and - keys
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

/**
 * Sets the acceleration state of the rocket
 * @param {Object} rocket - The rocket object
 * @param {boolean} state - Whether to accelerate or not
 * @param {boolean} isToggle - Whether this is a toggle action
 */
function setAcceleration(rocket, state, isToggle = false) {
    if (rocket.exploded) return;
    
    // Handle toggle behavior for the button
    if (isToggle) {
        window.gameControls.accelerateButtonActive = !window.gameControls.accelerateButtonActive;
        state = window.gameControls.accelerateButtonActive;
    }
    
    // Update rocket state
    rocket.accelerating = state;
    
    // Update button appearance
    const accelerateBtn = document.getElementById('accelerateBtn');
    if (accelerateBtn) {
        if (state) {
            accelerateBtn.classList.add('active');
        } else {
            accelerateBtn.classList.remove('active');
        }
    }
}

/**
 * Updates the UI elements with game state
 * @param {Object} rocket - The rocket object
 * @param {number} orbitCount - Number of completed orbits
 */
function updateUI(rocket, orbitCount) {
    // Update fuel display
    document.getElementById('fuelLevel').textContent = Math.round(rocket.fuel);
    
    // Update velocity display
    const velocity = Math.sqrt(rocket.velocity.x * rocket.velocity.x + rocket.velocity.y * rocket.velocity.y);
    document.getElementById('velocity').textContent = velocity.toFixed(2);
    
    updateAltitude(rocket);
}

/**
 * Updates the altitude display
 * @param {Object} rocket - The rocket object
 */
function updateAltitude(rocket) {
    const altitude = calculateAltitude(rocket.x, rocket.y, CELESTIAL_BODIES.EARTH);
    
    // Format altitude with appropriate units
    let displayAltitude;
    if (altitude < 1000) {
        displayAltitude = `${Math.round(altitude)}m`;
    } else if (altitude < 1000000) {
        displayAltitude = `${(altitude / 1000).toFixed(1)}km`;
    } else {
        displayAltitude = `${(altitude / 1000000).toFixed(1)}Mm`;
    }
    
    // Update altitude display
    const altitudeDisplay = document.getElementById('altitude');
    if (altitudeDisplay) {
        altitudeDisplay.textContent = `Altitude: ${displayAltitude}`;
    }
}

/**
 * Calculates the distance between two points
 * @param {number} x1 - X-coordinate of the first point
 * @param {number} y1 - Y-coordinate of the first point
 * @param {number} x2 - X-coordinate of the second point
 * @param {number} y2 - Y-coordinate of the second point
 * @returns {number} The distance between the two points
 */
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

/**
 * Calculates the altitude of an object above a celestial body
 * @param {number} x - X-coordinate of the object
 * @param {number} y - Y-coordinate of the object
 * @param {Object} celestialBody - The celestial body object
 * @returns {number} The altitude of the object above the celestial body
 */
function calculateAltitude(x, y, celestialBody) {
    const distance = calculateDistance(x, y, celestialBody.position.x, celestialBody.position.y);
    return Math.max(0, distance - celestialBody.radius);
}

// Export functions
window.setAcceleration = setAcceleration;
window.createControls = createControls;
window.setupEventListeners = setupEventListeners;
window.handleInput = handleInput;
window.updateUI = updateUI;
