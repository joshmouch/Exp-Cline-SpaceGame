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
    
    // Set up camera transform
    setupCameraTransform(ctx, camera, canvas.width, canvas.height);
    
    // Draw stars
    drawStars(ctx, stars, gameTime);
    
    // Always draw sun and planets
    drawSun(ctx, gameTime);
    drawPlanets(ctx);
    drawMoon(ctx);
    
    // Draw Earth
    drawEarth(ctx, gameTime, waterTwinkles, clouds);
    
    // Draw orbit path
    drawOrbitPath(ctx, orbitPath);
    
    // Draw trajectory
    drawTrajectory(ctx, rocket, trajectoryPoints);
    
    // Draw rocket
    drawRocket(ctx, rocket);
    
    // Draw orbit guide
    drawOrbitGuide(ctx, rocket);
    
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
        
        // Create a gradient for the line with more vibrant colors
        const gradient = ctx.createLinearGradient(
            rocket.x, rocket.y,
            trajectoryPoints[trajectoryPoints.length - 1].x,
            trajectoryPoints[trajectoryPoints.length - 1].y
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.9)'); // Bright cyan at start
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)'); // White in middle
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0.3)'); // Fading to magenta
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4; // Increased line width for better visibility
        
        // Draw the trajectory path
        trajectoryPoints.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        
        // Draw dots at intervals with fading opacity
        for (let i = 0; i < trajectoryPoints.length; i += 15) {
            if (i < trajectoryPoints.length) {
                const point = trajectoryPoints[i];
                const opacity = point.opacity !== undefined ? point.opacity : 0.8;
                const dotSize = Math.max(1, 3 - (i / trajectoryPoints.length) * 2); // Dots get smaller with distance
                
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
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
 * Draws the rocket's orbit path
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array} orbitPath - Array of orbit path points
 */
function drawOrbitPath(ctx, orbitPath) {
    if (orbitPath.length > 1) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(orbitPath[0].x, orbitPath[0].y);
        for (let i = 1; i < orbitPath.length; i++) {
            ctx.lineTo(orbitPath[i].x, orbitPath[i].y);
        }
        ctx.stroke();
    }
}

/**
 * Draws the orbit guide
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} rocket - The rocket object
 */
function drawOrbitGuide(ctx, rocket) {
    if (!rocket.landed && !rocket.exploded) {
        // Draw a circular guide showing ideal orbital path
        const idealOrbitRadius = EARTH_RADIUS * 3;
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, idealOrbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
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
