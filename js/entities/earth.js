// Use EARTH_CLOUDS from clouds.js

/**
 * Creates an array of water twinkle objects for Earth
 * @param {number} count - Number of water twinkles to create
 * @returns {Array} Array of water twinkle objects
 */
function createWaterTwinkles(count) {
    const waterTwinkles = [];
    for (let i = 0; i < count; i++) {
        waterTwinkles.push({
            angle: Math.random() * Math.PI * 2,
            latitude: Math.random() * Math.PI - Math.PI / 2,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
    return waterTwinkles;
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

/**
 * Draws Earth with atmosphere, clouds, and land masses
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} gameTime - Current game time for animations
 * @param {Array} waterTwinkles - Array of water twinkle objects
 */
function drawEarth(ctx, gameTime, waterTwinkles) {
    const earth = CELESTIAL_BODIES.EARTH;
    const { position: { x, y }, radius } = earth;
    const atmosphereWidth = radius * 0.15;
    
    // Draw atmosphere glow
    const atmosphereGradient = createBodyGradient(ctx, earth, 1, 1.15, [
        { offset: 0, color: 'rgba(135, 206, 235, 0.3)' },
        { offset: 0.5, color: 'rgba(135, 206, 235, 0.1)' },
        { offset: 1, color: 'rgba(135, 206, 235, 0)' }
    ]);
    
    ctx.fillStyle = atmosphereGradient;
    drawBasicBody(ctx, { position: earth.position, radius: radius + atmosphereWidth });
    
    // Earth base
    drawBasicBody(ctx, earth);
    
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
        const twinkleX = x + Math.cos(twinkle.angle) * Math.cos(twinkle.latitude) * radius;
        const twinkleY = y + Math.sin(twinkle.angle) * Math.cos(twinkle.latitude) * radius;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
        ctx.beginPath();
        ctx.arc(twinkleX, twinkleY, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Earth clouds are initialized in clouds.js
    
    // Update Earth clouds
    updateClouds(EARTH_CLOUDS, gameTime);
    
    // Draw Earth clouds
    drawClouds(ctx, earth, EARTH_CLOUDS);
}

// Export functions to window
window.createWaterTwinkles = createWaterTwinkles;
window.drawEarth = drawEarth;
