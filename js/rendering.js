/**
 * Renders the entire game scene
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} gameState - The current game state
 */
function renderScene(ctx, gameState) {
    const { 
        canvas, 
        rocket, 
        camera, 
        stars, 
        clouds, 
        waterTwinkles, 
        trajectoryPoints, 
        orbitPath, 
        orbitCount, 
        gameTime 
    } = gameState;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars before camera transform (fixed background)
    drawStars(ctx, stars, gameTime, canvas.width, canvas.height);
    
    // Set up camera transform
    setupCameraTransform(ctx, camera, canvas.width, canvas.height);
    
    // Draw orbital paths
    drawOrbitalPaths(ctx);
    
    // Always draw sun and planets
    drawSun(ctx, gameTime);
    drawPlanets(ctx);
    drawMoon(ctx);
    
    // Draw Earth (clouds are now handled internally)
    drawEarth(ctx, gameTime, waterTwinkles);
    
    // Draw trajectory below rocket
    drawTrajectory(ctx, rocket, trajectoryPoints);
    
    // Draw rocket on top with game time for flame animation
    drawRocket(ctx, rocket, gameTime);
    
    // Reset camera transform for UI elements
    resetCameraTransform(ctx);
    
    // Draw orbit count
    drawOrbitCount(ctx, orbitCount);
}

/**
 * Draws the rocket's trajectory
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} rocket - The rocket object
 * @param {Array} trajectoryPoints - Array of trajectory points
 */
function drawTrajectory(ctx, rocket, trajectoryPoints) {
    if (trajectoryPoints.length > 0) {
        // Draw a single continuous trajectory line with gradient opacity
        ctx.beginPath();
        ctx.moveTo(rocket.x, rocket.y);
        
        // Create a gradient for the line with more subtle colors
        const gradient = ctx.createLinearGradient(
            rocket.x, rocket.y,
            trajectoryPoints[trajectoryPoints.length - 1].x,
            trajectoryPoints[trajectoryPoints.length - 1].y
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)'); // More transparent cyan at start
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)'); // More transparent white in middle
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0.2)'); // More transparent magenta at end
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2; // Thinner line
        
        // Draw the trajectory path
        trajectoryPoints.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        
        // Draw dots at wider intervals with fading opacity
        for (let i = 0; i < trajectoryPoints.length; i += TRAJECTORY_SKIP) {
            if (i < trajectoryPoints.length) {
                const point = trajectoryPoints[i];
                const opacity = point.opacity !== undefined ? point.opacity : 0.5;
                const dotSize = Math.max(1, 2.5 - (i / trajectoryPoints.length) * 2); // Slightly smaller dots
                
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.7})`; // More transparent dots
                ctx.beginPath();
                ctx.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw an arrow at the end of the trajectory to indicate direction
        if (trajectoryPoints.length > 2) {
            const lastPoint = trajectoryPoints[trajectoryPoints.length - 1];
            const prevPoint = trajectoryPoints[trajectoryPoints.length - 2];
            
            // Calculate direction vector
            const dx = lastPoint.x - prevPoint.x;
            const dy = lastPoint.y - prevPoint.y;
            const angle = Math.atan2(dy, dx);
            
            // Draw arrow head
            ctx.save();
            ctx.translate(lastPoint.x, lastPoint.y);
            ctx.rotate(angle);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, -5);
            ctx.lineTo(-10, 5);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }
}

/**
 * Draws the orbit count
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} orbitCount - Number of completed orbits
 */
function drawOrbitCount(ctx, orbitCount) {
    if (orbitCount > 0) {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Orbits: ${orbitCount}`, 20, 30);
    }
}

/**
 * Resizes the canvas to fill the window
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
