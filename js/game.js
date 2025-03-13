/**
 * Main game class that coordinates all components
 */
class Game {
    constructor() {
        // Initialize canvas
        this.canvas = document.getElementById('gameCanvas');
        
        // Initialize components
        this.physics = new Physics();
        this.solarSystem = new SolarSystem();
        this.renderer = new Renderer(this.canvas);
        
        // Create spacecraft
        this.initSpacecraft();
        
        // Game state
        this.gameState = 'playing'; // playing, paused, gameOver
        this.lastUpdateTime = 0;
        this.trajectoryPoints = [];
        this.trajectoryUpdateCounter = 0;
        this.gameStartTime = performance.now();
        this.collisionDetectionEnabled = false;
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Start game loop
        this.startGameLoop();
        
        // Hide game over screen if visible
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }

    initSpacecraft() {
        // Get Earth for initial position
        const earth = this.solarSystem.getBodyByName('Earth');
        
        // Position spacecraft well above Earth's surface
        const spawnAngle = -Math.PI / 2; // Top of Earth
        const spawnPosition = earth.position.add(
            new Vector(
                Math.cos(spawnAngle) * (earth.radius + 100),
                Math.sin(spawnAngle) * (earth.radius + 100)
            )
        );
        
        // Create spacecraft
        this.spacecraft = new Spacecraft({
            position: spawnPosition,
            angle: spawnAngle
        });
        
        // Set camera to follow spacecraft
        this.renderer.followTarget(this.spacecraft);
        this.renderer.setZoom(0.8); // Initial zoom level
    }

    setupInputHandlers() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Touch/mouse controls for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // UI button controls
        const thrustButton = document.getElementById('thrustButton');
        if (thrustButton) {
            thrustButton.addEventListener('mousedown', () => this.spacecraft.applyThrust(true));
            thrustButton.addEventListener('mouseup', () => this.spacecraft.applyThrust(false));
            thrustButton.addEventListener('touchstart', () => this.spacecraft.applyThrust(true));
            thrustButton.addEventListener('touchend', () => this.spacecraft.applyThrust(false));
        }
        
        const zoomInButton = document.getElementById('zoomIn');
        if (zoomInButton) {
            zoomInButton.addEventListener('click', () => this.renderer.zoomIn());
        }
        
        const zoomOutButton = document.getElementById('zoomOut');
        if (zoomOutButton) {
            zoomOutButton.addEventListener('click', () => this.renderer.zoomOut());
        }
        
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartGame());
        }
    }

    handleKeyDown(e) {
        if (this.gameState !== 'playing') return;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                this.spacecraft.applyThrust(true);
                break;
            case 'ArrowLeft':
            case 'a':
                this.spacecraft.rotateLeft(true);
                break;
            case 'ArrowRight':
            case 'd':
                this.spacecraft.rotateRight(true);
                break;
            case 'l':
                this.spacecraft.toggleLandingGear();
                break;
            case '+':
                this.renderer.zoomIn();
                break;
            case '-':
                this.renderer.zoomOut();
                break;
            case 'p':
                this.togglePause();
                break;
            case 'r':
                this.restartGame();
                break;
        }
    }

    handleKeyUp(e) {
        if (this.gameState !== 'playing') return;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                this.spacecraft.applyThrust(false);
                break;
            case 'ArrowLeft':
            case 'a':
                this.spacecraft.rotateLeft(false);
                break;
            case 'ArrowRight':
            case 'd':
                this.spacecraft.rotateRight(false);
                break;
        }
    }

    handleTouchStart(e) {
        if (this.gameState !== 'playing') return;
        
        // Implement touch controls
        // This would be more complex in a real game
    }

    handleTouchMove(e) {
        if (this.gameState !== 'playing') return;
        
        // Implement touch controls
    }

    handleTouchEnd(e) {
        if (this.gameState !== 'playing') return;
        
        // Implement touch controls
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.lastUpdateTime = performance.now();
        }
    }

    restartGame() {
        // Hide game over screen
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
        
        // Reset solar system
        this.solarSystem = new SolarSystem();
        
        // Reset spacecraft
        this.initSpacecraft();
        
        // Reset game state
        this.gameState = 'playing';
        this.lastUpdateTime = performance.now();
        this.gameStartTime = performance.now();
        this.collisionDetectionEnabled = false;
    }

    startGameLoop() {
        this.lastUpdateTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = (timestamp - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = timestamp;
        
        // Update game if not paused
        if (this.gameState === 'playing') {
            this.update(deltaTime);
        }
        
        // Render the game
        this.render();
        
        // Continue the game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    update(deltaTime) {
        // Cap delta time to prevent large jumps
        const cappedDeltaTime = Math.min(deltaTime, 0.1);
        
        // Enable collision detection after 1 second
        if (!this.collisionDetectionEnabled && performance.now() - this.gameStartTime > 1000) {
            this.collisionDetectionEnabled = true;
            console.log("Collision detection enabled");
        }
        
        // Update solar system
        this.solarSystem.update(cappedDeltaTime);
        
        // Update spacecraft with collision detection flag
        this.spacecraft.collisionDetectionEnabled = this.collisionDetectionEnabled;
        this.spacecraft.update(cappedDeltaTime, this.solarSystem.bodies, this.physics);
        
        // Update renderer effects
        this.renderer.update(cappedDeltaTime);
        
        // Update camera to follow spacecraft
        this.renderer.followTarget(this.spacecraft);
        
        // Update trajectory prediction (not every frame for performance)
        this.trajectoryUpdateCounter += cappedDeltaTime;
        if (this.trajectoryUpdateCounter >= 0.5) { // Update every 0.5 seconds
            this.updateTrajectory();
            this.trajectoryUpdateCounter = 0;
        }
        
        // Check for game over conditions
        this.checkGameOver();
    }

    updateTrajectory() {
        // Only show trajectory if moving and not landed
        if (this.spacecraft.landed || this.spacecraft.crashed) {
            this.trajectoryPoints = [];
            return;
        }
        
        // Calculate trajectory prediction
        this.trajectoryPoints = this.physics.predictTrajectory(
            this.spacecraft.position,
            this.spacecraft.velocity,
            this.solarSystem.bodies
        );
    }

    checkGameOver() {
        if (this.spacecraft.crashed && this.gameState !== 'gameOver') {
            this.gameState = 'gameOver';
            this.showGameOver(false, this.spacecraft.crashReason);
        }
    }

    showGameOver(success, message) {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        
        if (gameOverScreen && gameOverTitle && gameOverMessage) {
            gameOverTitle.textContent = success ? 'MISSION SUCCESSFUL' : 'MISSION FAILED';
            gameOverTitle.style.color = success ? '#4caf50' : '#ff4d4d';
            gameOverMessage.textContent = message || (success ? 'You completed the mission!' : 'Your spacecraft crashed!');
            gameOverScreen.classList.remove('hidden');
        }
    }

    render() {
        // Render the game using the renderer
        this.renderer.render(this);
    }
}

// Initialize the game when the start button is clicked
document.addEventListener('DOMContentLoaded', () => {
    // Show start screen, hide game UI
    const startScreen = document.getElementById('startScreen');
    const uiContainer = document.querySelector('.ui-container');
    
    if (uiContainer) {
        uiContainer.style.display = 'none';
    }
    
    // Add event listener to start button
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', () => {
            // Hide start screen
            startScreen.classList.add('hidden');
            
            // Show game UI
            if (uiContainer) {
                uiContainer.style.display = 'block';
            }
            
            // Initialize game
            const game = new Game();
            
            // Log controls to console
            console.log('Cosmic Explorer Controls:');
            console.log('- Arrow Up / W: Apply thrust');
            console.log('- Arrow Left / A: Rotate left');
            console.log('- Arrow Right / D: Rotate right');
            console.log('- L: Toggle landing gear');
            console.log('- + / -: Zoom in/out');
            console.log('- P: Pause game');
            console.log('- R: Restart game');
        });
    }
});
