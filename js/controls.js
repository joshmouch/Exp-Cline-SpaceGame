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
 * Sets the rocket's acceleration state
 * @param {Object} rocket - The rocket object
 * @param {boolean} state - Whether to accelerate or not
 * @param {boolean} isToggle - Whether to toggle the state (true) or set it directly (false)
 */
function setAcceleration(rocket, state, isToggle = false) {
    if (!rocket) {
        console.error('Rocket object is undefined in setAcceleration');
        return;
    }
    
    console.log('setAcceleration called with:', { rocket, state, isToggle });
    
    if (isToggle) {
        // Toggle mode (for button)
        if (rocket.fuel > 0 && !rocket.exploded) {
            rocket.accelerating = !rocket.accelerating;
            console.log('Toggling acceleration to:', rocket.accelerating);
            document.getElementById('accelerateBtn').classList.toggle('active', rocket.accelerating);
            
            // Update the controls state to track button activation
            const controls = window.gameControls; // Access the global controls object
            if (controls) {
                controls.accelerateButtonActive = rocket.accelerating;
                console.log('Button active state set to:', controls.accelerateButtonActive);
            }
        } else {
            rocket.accelerating = false;
            document.getElementById('accelerateBtn').classList.remove('active');
            
            // Update the controls state
            const controls = window.gameControls;
            if (controls) {
                controls.accelerateButtonActive = false;
            }
        }
    } else {
        // Direct mode (for key) - only set the rocket's state, don't affect the button
        if (rocket.fuel > 0 && !rocket.exploded) {
            rocket.accelerating = state;
        } else {
            rocket.accelerating = false;
        }
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
    
    // Calculate distance from Earth center
    const dx = rocket.x - CELESTIAL_BODIES.EARTH.position.x;
    const dy = rocket.y - CELESTIAL_BODIES.EARTH.position.y;
    const distanceFromEarth = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate altitude above Earth surface
    const altitude = Math.max(0, distanceFromEarth - CELESTIAL_BODIES.EARTH.radius);
    document.getElementById('altitude').textContent = Math.round(altitude);
    
    const velocity = Math.sqrt(rocket.velocity.x * rocket.velocity.x + rocket.velocity.y * rocket.velocity.y);
    document.getElementById('velocity').textContent = velocity.toFixed(2);
}
