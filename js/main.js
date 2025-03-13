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
    gameState.camera = createCamera();
    gameState.controls = createControls();
    
    // Generate visual elements
    gameState.stars = createStars(STAR_COUNT);
    gameState.clouds = createClouds(10);
    gameState.waterTwinkles = createWaterTwinkles(30);
    
    // Set up event listeners
    window.addEventListener('resize', () => resizeCanvas(gameState.canvas));
    setupEventListeners(
        gameState.controls, 
        gameState.camera, 
        () => toggleAcceleration(gameState.rocket),
        resetGame
    );
    
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
    
    // Reset UI
    document.getElementById('accelerateBtn').classList.remove('active');
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
        }
        
        // Apply gravity from celestial bodies
        applyEarthGravity(gameState.rocket);
        
        if (gameState.camera.zoom < 0.5) {
            applyMoonGravity(gameState.rocket);
            applySunGravity(gameState.rocket);
        }
        
        // Update rocket position
        updateRocketPosition(gameState.rocket);
        
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
        
        // Check for collision with Earth
        const landingResult = checkLanding(gameState.rocket, 0, 0, EARTH_RADIUS, 1.0);
        if (landingResult.success) {
            // Safe landing
            gameState.rocket.landed = true;
            gameState.rocket.velocity = { x: 0, y: 0 };
            gameState.rocket.x = Math.cos(landingResult.landingAngle + Math.PI / 2) * landingResult.landingDistance;
            gameState.rocket.y = Math.sin(landingResult.landingAngle + Math.PI / 2) * landingResult.landingDistance;
            gameState.rocket.angle = landingResult.landingAngle;
        } else if (landingResult.landingAngle !== undefined) {
            // Crash landing
            gameState.rocket.exploded = true;
            gameState.rocket.velocity = { x: 0, y: 0 };
        }
        
        // Check for collision with Moon when zoomed out
        if (gameState.camera.zoom < 0.5) {
            const moonLandingResult = checkLanding(
                gameState.rocket, 
                MOON_POSITION.x, MOON_POSITION.y, // Moon position
                MOON_RADIUS, // Moon radius
                1.0 // Safe landing velocity
            );
            
            if (moonLandingResult.success) {
                // Safe landing on Moon
                gameState.rocket.landed = true;
                gameState.rocket.velocity = { x: 0, y: 0 };
                gameState.rocket.x = MOON_POSITION.x + Math.cos(moonLandingResult.landingAngle) * moonLandingResult.landingDistance;
                gameState.rocket.y = MOON_POSITION.y + Math.sin(moonLandingResult.landingAngle) * moonLandingResult.landingDistance;
                gameState.rocket.angle = moonLandingResult.landingAngle;
            } else if (moonLandingResult.landingAngle !== undefined) {
                // Crash landing on Moon
                gameState.rocket.exploded = true;
                gameState.rocket.velocity = { x: 0, y: 0 };
            }
        }
    } else if (gameState.rocket.landed && !gameState.rocket.exploded) {
        // Launch from surface
        if (gameState.rocket.accelerating && gameState.rocket.fuel > 0) {
            launchRocket(gameState.rocket, EARTH_RADIUS);
        }
    }
    
    // Update camera
    updateCamera(gameState.camera, gameState.rocket, gameState.trajectoryPoints, gameState.controls);
    
    // Update clouds
    updateClouds(gameState.clouds);
    
    // Calculate trajectory with more points for better visibility
    gameState.trajectoryPoints = calculateTrajectory(gameState.rocket, TRAJECTORY_POINTS);
    
    // Debug: Log trajectory points count
    if (gameState.trajectoryPoints.length > 0 && gameState.gameTime % 60 < 1) {
        console.log(`Trajectory points: ${gameState.trajectoryPoints.length}`);
        console.log(`Last trajectory point: x=${gameState.trajectoryPoints[gameState.trajectoryPoints.length-1].x}, y=${gameState.trajectoryPoints[gameState.trajectoryPoints.length-1].y}`);
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
