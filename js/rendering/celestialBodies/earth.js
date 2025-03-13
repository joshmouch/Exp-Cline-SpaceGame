/**
 * Draws Earth with atmosphere, clouds, and land masses
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} gameTime - Current game time for animations
 * @param {Array} waterTwinkles - Array of water twinkle objects
 * @param {Array} clouds - Array of cloud objects
 */
function drawEarth(ctx, gameTime, waterTwinkles, clouds) {
    const earth = CELESTIAL_BODIES.EARTH;
    const earthRadius = earth.radius;
    const atmosphereWidth = earthRadius * 0.15; // Atmosphere extends 15% beyond radius
    
    // Draw atmosphere glow
    const atmosphereGradient = ctx.createRadialGradient(
        earth.position.x, earth.position.y, earthRadius,
        earth.position.x, earth.position.y, earthRadius + atmosphereWidth
    );
    atmosphereGradient.addColorStop(0, 'rgba(135, 206, 235, 0.3)'); // Sky blue
    atmosphereGradient.addColorStop(0.5, 'rgba(135, 206, 235, 0.1)');
    atmosphereGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
    
    ctx.fillStyle = atmosphereGradient;
    ctx.beginPath();
    ctx.arc(earth.position.x, earth.position.y, earthRadius + atmosphereWidth, 0, Math.PI * 2);
    ctx.fill();
    
    // Earth base
    ctx.fillStyle = earth.color;
    ctx.beginPath();
    ctx.arc(earth.position.x, earth.position.y, earthRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Earth land masses
    ctx.fillStyle = '#10b981';
    
    // North America
    drawLandmass(ctx, -0.2, -0.3, 0.3, 0.25);
    
    // South America
    drawLandmass(ctx, -0.1, 0.1, 0.15, 0.3);
    
    // Europe and Africa
    drawLandmass(ctx, 0.2, -0.1, 0.25, 0.5);
    
    // Asia and Australia
    drawLandmass(ctx, 0.5, -0.2, 0.4, 0.4);
    
    // Water twinkles
    waterTwinkles.forEach(twinkle => {
        const brightness = 0.5 + 0.5 * Math.sin(gameTime * twinkle.twinkleSpeed + twinkle.twinkleOffset);
        const x = earth.position.x + Math.cos(twinkle.angle) * Math.cos(twinkle.latitude) * earthRadius;
        const y = earth.position.y + Math.sin(twinkle.angle) * Math.cos(twinkle.latitude) * earthRadius;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw clouds with enhanced blending
    ctx.globalCompositeOperation = 'lighter';
    clouds.forEach(cloud => {
        const cloudDistance = earthRadius + atmosphereWidth * 0.3; // Position clouds in lower atmosphere
        const x = earth.position.x + Math.cos(cloud.angle) * cloudDistance;
        const y = earth.position.y + Math.sin(cloud.angle) * cloudDistance;
        
        // Draw cloud base shape with gradient for depth
        const cloudGradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, cloudDistance * 0.1
        );
        cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.arc(x, y, cloudDistance * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Draw each puff with its own opacity
        cloud.puffs.forEach(puff => {
            const puffGradient = ctx.createRadialGradient(
                x + puff.offsetX,
                y + puff.offsetY,
                0,
                x + puff.offsetX,
                y + puff.offsetY,
                puff.radius
            );
            puffGradient.addColorStop(0, `rgba(255, 255, 255, ${puff.opacity})`);
            puffGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = puffGradient;
            ctx.beginPath();
            ctx.arc(
                x + puff.offsetX,
                y + puff.offsetY,
                puff.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
    });
    
    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
}

/**
 * Draws a land mass on Earth
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} centerX - X coordinate of the land mass center relative to Earth radius
 * @param {number} centerY - Y coordinate of the land mass center relative to Earth radius
 * @param {number} width - Width of the land mass relative to Earth radius
 * @param {number} height - Height of the land mass relative to Earth radius
 */
function drawLandmass(ctx, centerX, centerY, width, height) {
    const earth = CELESTIAL_BODIES.EARTH;
    const earthRadius = earth.radius;
    const x = earth.position.x + centerX * earthRadius;
    const y = earth.position.y + centerY * earthRadius;
    const w = width * earthRadius;
    const h = height * earthRadius;
    
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Export the drawing function
window.drawEarth = drawEarth;
