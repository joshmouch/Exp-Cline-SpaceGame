/**
 * Creates an array of cloud objects for Earth
 * @param {number} count - Number of clouds to create
 * @returns {Array} Array of cloud objects
 */
function createClouds(count) {
    const clouds = [];
    for (let i = 0; i < count; i++) {
        // Create flatter cloud shapes
        const cloudWidth = Math.random() * 35 + 25; // Slightly wider
        const cloudHeight = Math.random() * 6 + 4; // Much flatter
        
        // All clouds move in the same direction (positive = counterclockwise)
        // Speed range increased by 10x for faster movement
        const speed = (Math.random() * 0.001 + 0.0005); // 10x faster than before
        
        // Add some bumps to make clouds look puffy but flat
        const bumpCount = Math.floor(Math.random() * 3) + 2; // 2-4 bumps per cloud
        const bumps = [];
        
        for (let j = 0; j < bumpCount; j++) {
            bumps.push({
                offsetX: (Math.random() * 0.7 - 0.35) * cloudWidth, // Offset within cloud width
                offsetY: (Math.random() * 0.4 - 0.2) * cloudHeight, // Smaller vertical offset for flatter appearance
                size: (Math.random() * 0.3 + 0.2) * cloudHeight // Smaller bumps for flatter appearance
            });
        }
        
        clouds.push({
            angle: Math.random() * Math.PI * 2, // Position around Earth
            width: cloudWidth,
            height: cloudHeight,
            opacity: 0.25 + Math.random() * 0.15, // Slightly more solid (0.25-0.4 range)
            speed: speed, // All positive for same direction
            bumps: bumps // Add bumps for puffy appearance
        });
    }
    return clouds;
}

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
 * Updates cloud positions
 * @param {Array} clouds - Array of cloud objects
 */
function updateClouds(clouds) {
    clouds.forEach(cloud => {
        cloud.angle += cloud.speed;
        
        // Keep angle within 0-2π range to avoid floating point issues over time
        if (cloud.angle > Math.PI * 2) {
            cloud.angle -= Math.PI * 2;
        }
    });
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
 * @param {Array} clouds - Array of cloud objects
 */
function drawEarth(ctx, gameTime, waterTwinkles, clouds) {
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
    
    // Draw puffier, cartoony clouds that hug Earth's curvature
    ctx.globalCompositeOperation = 'lighter';
    clouds.forEach(cloud => {
        // Position cloud to follow Earth's curvature
        const cloudDistance = radius + atmosphereWidth * 0.15; // Closer to surface
        const cloudAngle = cloud.angle;
        
        // Calculate cloud position
        const cloudCenterX = x + Math.cos(cloudAngle) * cloudDistance;
        const cloudCenterY = y + Math.sin(cloudAngle) * cloudDistance;
        
        // Draw cloud shape
        ctx.save();
        ctx.translate(cloudCenterX, cloudCenterY);
        ctx.rotate(cloudAngle + Math.PI/2); // Rotate to follow Earth's curvature
        
        // Use a solid color with minimal gradient for a flatter look
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        
        // Draw main cloud body as a flat ellipse
        ctx.beginPath();
        ctx.ellipse(0, 0, cloud.width, cloud.height, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bumps to maintain some puffiness while keeping flat
        cloud.bumps.forEach(bump => {
            // Use the same solid color for bumps
            ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity * 1.1})`; // Just slightly brighter
            
            // Draw bump
            ctx.beginPath();
            ctx.arc(bump.offsetX, bump.offsetY, bump.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    });
    
    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
}

// Export functions to window
window.createClouds = createClouds;
window.createWaterTwinkles = createWaterTwinkles;
window.updateClouds = updateClouds;
window.drawEarth = drawEarth;
