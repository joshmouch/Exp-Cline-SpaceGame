// Game state
const gameState = {
    canvas: null,
    ctx: null,
    rocket: null,
    camera: null,
    controls: null,
    stars: [],
    clouds: [],
    waterTwinkles: [],
    trajectoryPoints: [],
    orbitPath: [],
    orbitCount: 0,
    lastQuadrant: 0,
    gameTime: 0
};

// Expose gameState to window for testing purposes
window.gameState = gameState;

/**
 * Initializes the game
 */
function init() {
    // Set up canvas
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    resizeCanvas(gameState.canvas);
    
    // Create game objects first
    gameState.rocket = createRocket();
    gameState.camera = createCamera();
    gameState.controls = createControls();
    
    // Set initial rocket state
    gameState.rocket.onBody = CELESTIAL_BODIES.EARTH;
    
    // Important: Use a fixed time for initial positions, matching what resetGame uses
    const initialTime = 0;
    
    // Initialize celestial body positions using the same approach as resetGame
    Object.keys(CELESTIAL_BODIES).forEach(key => {
        const body = CELESTIAL_BODIES[key];
        // For bodies that orbit something, reset their position based on initial parameters
        if (body.orbits) {
            const angle = initialTime * body.orbitSpeed + body.orbitPhase;
            const parent = getParentBody(body);
            if (parent) {
                body.position.x = parent.position.x + Math.cos(angle) * body.orbitRadius;
                body.position.y = parent.position.y + Math.sin(angle) * body.orbitRadius;
            }
        }
    });
    
    // Initialize orbital positions with the fixed initialization time
    updateOrbits(initialTime, gameState.rocket);
    
    // Position the rocket exactly at 12 o'clock on Earth with nose up - same as in resetGame
    const earth = CELESTIAL_BODIES.EARTH;
    const landingAngle = -Math.PI / 2; // Top of Earth (12 o'clock position)
    const distanceFromSurface = earth.radius + ROCKET_HEIGHT / 2 + 1; // Add 1 pixel margin
    
    gameState.rocket.x = earth.position.x + Math.cos(landingAngle) * distanceFromSurface;
    gameState.rocket.y = earth.position.y + Math.sin(landingAngle) * distanceFromSurface;
    gameState.rocket.angle = 0; // Point straight up (adjusted for drawing function)
    
    console.log(`Initial rocket position: (${gameState.rocket.x}, ${gameState.rocket.y}), angle: ${gameState.rocket.angle}`);
    
    // Make controls globally accessible for the setAcceleration function
    window.gameControls = gameState.controls;
    
    // Generate visual elements
    gameState.stars = createStars(STAR_COUNT);
    gameState.waterTwinkles = createWaterTwinkles(30);
    
    // Set up event listeners
    window.addEventListener('resize', () => resizeCanvas(gameState.canvas));
    setupEventListeners(
        gameState.controls, 
        gameState.camera, 
        (state, isToggle = false) => setAcceleration(gameState.rocket, state, isToggle),
        resetGame
    );
    
    // Set the dropdown value to match the initial focus
    document.getElementById('focusSelect').value = gameState.controls.focus;
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Resets the game to its initial state
 */
function resetGame() {
    // Create new rocket with proper initial state
    gameState.rocket = createRocket();
    gameState.rocket.onBody = CELESTIAL_BODIES.EARTH;
    
    // Important: Use a fixed time when initializing positions
    // This ensures consistency between resets and initial game start
    const initialTime = 0;
    
    // Reset celestial body positions to their initial state
    // This is critical to ensure consistent rocket positioning
    Object.keys(CELESTIAL_BODIES).forEach(key => {
        const body = CELESTIAL_BODIES[key];
        // For bodies that orbit something, reset their position based on initial parameters
        if (body.orbits) {
            const angle = initialTime * body.orbitSpeed + body.orbitPhase;
            const parent = getParentBody(body);
            if (parent) {
                body.position.x = parent.position.x + Math.cos(angle) * body.orbitRadius;
                body.position.y = parent.position.y + Math.sin(angle) * body.orbitRadius;
            }
        }
    });
    
    // Now update orbital positions and rocket position with fixed initial time
    updateOrbits(initialTime, gameState.rocket);
    
    // Position the rocket exactly at 12 o'clock on Earth with nose up
    const earth = CELESTIAL_BODIES.EARTH;
    const landingAngle = -Math.PI / 2; // Top of Earth (12 o'clock position)
    const distanceFromSurface = earth.radius + ROCKET_HEIGHT / 2 + 1; // Add 1 pixel margin
    
    gameState.rocket.x = earth.position.x + Math.cos(landingAngle) * distanceFromSurface;
    gameState.rocket.y = earth.position.y + Math.sin(landingAngle) * distanceFromSurface;
    gameState.rocket.angle = 0; // Point straight up (adjusted for drawing function)
    
    console.log(`Reset rocket position: (${gameState.rocket.x}, ${gameState.rocket.y}), angle: ${gameState.rocket.angle}`);
    
    // Reset camera
    gameState.camera = createCamera();
    
    // Reset trajectory and orbit data
    gameState.trajectoryPoints = [];
    gameState.orbitPath = [];
    gameState.orbitCount = 0;
    gameState.lastQuadrant = 0;
    
    // Reset controls
    gameState.controls.focus = 'ship';
    gameState.controls.accelerateButtonActive = false;
    
    // Reset UI
    document.getElementById('accelerateBtn').classList.remove('active');
    document.getElementById('focusSelect').value = 'ship';
}

/**
 * Helper function to get the parent body of an orbiting body
 * @param {Object} body - The orbiting celestial body
 * @returns {Object} The parent body
 */
function getParentBody(body) {
    if (!body.orbits) return null;
    
    const parentName = body.orbits.toLowerCase();
    let parent = null;
    
    Object.values(CELESTIAL_BODIES).forEach(celestialBody => {
        if (celestialBody.name.toLowerCase() === parentName) {
            parent = celestialBody;
        }
    });
    
    return parent;
}

/**
 * Main game loop
 * @param {number} timestamp - Current timestamp
 */
function gameLoop(timestamp) {
    gameState.gameTime = timestamp / 1000;
    update();
    render();
    requestAnimationFrame(gameLoop);
}

/**
 * Updates the game state
 */
function update() {
    // Update orbital positions and rocket position if landed
    updateOrbits(gameState.gameTime, gameState.rocket);
    
    // Handle user input
    handleInput(gameState.controls, gameState.rocket, gameState.camera);
    
    // Update rocket physics
    if (!gameState.rocket.landed && !gameState.rocket.exploded) {
        // Apply acceleration if rocket is accelerating
        if (gameState.rocket.accelerating && gameState.rocket.fuel > 0) {
            accelerateRocket(gameState.rocket);
            console.log(`Rocket accelerating: vel=(${gameState.rocket.velocity.x.toFixed(2)}, ${gameState.rocket.velocity.y.toFixed(2)})`);
        }
        
        // Apply gravity from all celestial bodies
        applyAllGravity(gameState.rocket);
        
        // Update rocket position
        updateRocketPosition(gameState.rocket);
        
        // Debug log
        if (gameState.gameTime % 1 < 0.02) {
            console.log(`Rocket pos=(${gameState.rocket.x.toFixed(2)}, ${gameState.rocket.y.toFixed(2)}), vel=(${gameState.rocket.velocity.x.toFixed(2)}, ${gameState.rocket.velocity.y.toFixed(2)})`);
        }
        
        // Store rocket path for orbit visualization
        if (gameState.gameTime % 0.1 < 0.02) {
            gameState.orbitPath.push({ x: gameState.rocket.x, y: gameState.rocket.y });
            // Keep only the last 1000 points to avoid memory issues
            if (gameState.orbitPath.length > 1000) {
                gameState.orbitPath.shift();
            }
        }
        
        // Track orbit completion
        const orbitResult = trackOrbit(gameState.rocket, gameState.lastQuadrant);
        gameState.lastQuadrant = orbitResult.lastQuadrant;
        
        if (orbitResult.orbitCompleted) {
            gameState.orbitCount++;
            // Clear orbit path when completing an orbit to show the new orbit
            if (gameState.orbitCount > 0 && gameState.orbitCount % 1 === 0) {
                gameState.orbitPath = [];
            }
        }
        
        // Check for landing on any celestial body
        for (const body of ALL_CELESTIAL_BODIES) {
            const landingResult = checkLanding(gameState.rocket, body);
            
            if (landingResult.landingAngle !== undefined) {
                if (landingResult.success) {
                    // Safe landing
                    gameState.rocket.landed = true;
                    gameState.rocket.velocity = { x: 0, y: 0 };
                    gameState.rocket.onBody = body;
                    
                    // Calculate position on the surface based on the landing angle
                    const landingAngle = landingResult.landingAngle;
                    // Add a small distance margin to prevent collision/falling through
                    const positionDistance = body.radius + ROCKET_HEIGHT / 2 + 1;
                    
                    // Special case for landing exactly at the top of Earth (12 o'clock position)
                    if (body === CELESTIAL_BODIES.EARTH && 
                        Math.abs(landingAngle + Math.PI/2) < 0.2) { // If landing close to -PI/2 (top)
                        // Place exactly at 12 o'clock position
                        gameState.rocket.x = body.position.x;
                        gameState.rocket.y = body.position.y - positionDistance;
                        gameState.rocket.angle = 0; // Point straight up (adjusted for drawing function)
                    } else {
                        // Standard landing at calculated position
                        gameState.rocket.x = body.position.x + Math.cos(landingAngle) * positionDistance;
                        gameState.rocket.y = body.position.y + Math.sin(landingAngle) * positionDistance;
                        
                        // Make sure rocket is perpendicular to the surface
                        // Use -Math.PI (straight up) when at the top of the planet (12 o'clock position)
                        if (landingAngle <= -Math.PI/4 && landingAngle >= -3*Math.PI/4) {
                            gameState.rocket.angle = 0; // Point straight up (12 o'clock)
                        } else {
                            gameState.rocket.angle = landingAngle - Math.PI/2 + Math.PI; // Standard perpendicular direction, adjusted for drawing
                        }
                    }
                    
                    console.log(`Landed on ${body.name} at angle: ${landingAngle.toFixed(2)}, position: (${gameState.rocket.x.toFixed(2)}, ${gameState.rocket.y.toFixed(2)})`);
                } else {
                    // Crash landing
                    gameState.rocket.exploded = true;
                    gameState.rocket.velocity = { x: 0, y: 0 };
                    console.log(`Crashed on ${body.name}`);
                }
                break;
            }
        }
    } else if (gameState.rocket.landed && !gameState.rocket.exploded) {
        // Launch from surface
        console.log(`Rocket landed state: landed=${gameState.rocket.landed}, accelerating=${gameState.rocket.accelerating}, fuel=${gameState.rocket.fuel}`);
        
        if (gameState.rocket.accelerating && gameState.rocket.fuel > 0) {
            console.log("Rocket is accelerating and has fuel, attempting to launch");
            
            // Find the body we're on by checking distances
            for (const body of ALL_CELESTIAL_BODIES) {
                const dx = body.position.x - gameState.rocket.x;
                const dy = body.position.y - gameState.rocket.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                console.log(`Checking distance to ${body.name}: ${distance} vs ${body.radius * 1.5}`);
                
                // If we're close to this body, launch from it
                if (distance < body.radius * 1.5) {
                    console.log(`Close enough to ${body.name} to launch`);
                    const success = launchRocket(gameState.rocket, body);
                    console.log(`Launched from ${body.name}: ${success}, new landed state=${gameState.rocket.landed}`);
                    console.log(`Rocket position: (${gameState.rocket.x.toFixed(2)}, ${gameState.rocket.y.toFixed(2)})`);
                    console.log(`Rocket velocity: (${gameState.rocket.velocity.x.toFixed(2)}, ${gameState.rocket.velocity.y.toFixed(2)})`);
                    break;
                }
            }
        }
    }
    
    // Update camera
    updateCamera(gameState.camera, gameState.rocket, gameState.trajectoryPoints, gameState.controls);
    
    // No need to update clouds here anymore - handled in drawEarth
    
    // Only recalculate trajectory when rocket state changes
    if (gameState.rocket.accelerating || gameState.rocket.velocity.x !== 0 || gameState.rocket.velocity.y !== 0) {
        gameState.trajectoryPoints = calculateTrajectory(gameState.rocket, TRAJECTORY_POINTS);
    }
    
    // Update UI
    updateUI(gameState.rocket, gameState.orbitCount);
}

/**
 * Renders the game
 */
function render() {
    renderScene(gameState.ctx, gameState);
}

// Start the game when the page loads
window.addEventListener('load', init);
