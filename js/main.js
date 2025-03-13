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

/**
 * Initializes the game
 */
function init() {
    // Set up canvas
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    resizeCanvas(gameState.canvas);
    
    // Create game objects
    gameState.rocket = createRocket();
    console.log('Initial rocket state:', {
        position: { x: gameState.rocket.x, y: gameState.rocket.y },
        velocity: { x: gameState.rocket.velocity.x, y: gameState.rocket.velocity.y },
        angle: gameState.rocket.angle,
        landed: gameState.rocket.landed,
        fuel: gameState.rocket.fuel
    });
    gameState.camera = createCamera();
    gameState.controls = createControls();
    
    // Make controls globally accessible for the setAcceleration function
    window.gameControls = gameState.controls;
    
    // Generate visual elements
    gameState.stars = createStars(STAR_COUNT);
    gameState.clouds = createClouds(20); // More clouds for better coverage
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
    // Reset rocket
    gameState.rocket = createRocket();
    
    // Reset camera
    gameState.camera = createCamera();
    
    // Reset trajectory and orbit data
    gameState.trajectoryPoints = [];
    gameState.orbitPath = [];
    gameState.orbitCount = 0;
    gameState.lastQuadrant = 0;
    
    // Reset controls
    gameState.controls.focus = 'ship';
    
    // Reset UI
    document.getElementById('accelerateBtn').classList.remove('active');
    document.getElementById('focusSelect').value = 'ship';
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
                    gameState.rocket.x = body.position.x + Math.cos(landingResult.landingAngle) * landingResult.landingDistance;
                    gameState.rocket.y = body.position.y + Math.sin(landingResult.landingAngle) * landingResult.landingDistance;
                    gameState.rocket.angle = landingResult.landingAngle;
                    console.log(`Landed on ${body.name}`);
                } else {
                    // Crash landing
                    gameState.rocket.exploded = true;
                    gameState.rocket.velocity = { x: 0, y: 0 };
                    console.log(`Crashed on ${body.name}`);
                }
                
                // Break the loop once we've landed or crashed
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
    
    // Update clouds with game time for animations
    updateClouds(gameState.clouds, gameState.gameTime);
    
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
