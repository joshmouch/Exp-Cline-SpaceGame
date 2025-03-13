/**
 * Creates an array of cloud objects for Earth
 * @param {number} count - Number of clouds to create
 * @returns {Array} Array of cloud objects
 */
function createClouds(count) {
    const clouds = [];
    
    // Create a single cloud type that follows Earth's curvature better
    for (let i = 0; i < count; i++) {
        // Create smaller, more compact clouds
        const cloudSize = Math.random() * 15 + 10; // Smaller overall size
        const opacity = Math.random() * 0.2 + 0.2; // 0.2-0.4 range
        
        // Random position around Earth
        const angle = Math.random() * Math.PI * 2;
        
        // Random rotation of the cloud pattern
        const rotation = Math.random() * Math.PI;
        
        // Random speed (all moving in same direction)
        const speed = Math.random() * 0.0005 + 0.0002;
        
        // Create cloud segments (3-5 segments per cloud)
        const segmentCount = Math.floor(Math.random() * 3) + 3;
        const segments = [];
        
        // Create segments in a more compact, curved arrangement
        for (let j = 0; j < segmentCount; j++) {
            // Position segments in an arc to follow Earth's curvature
            const segmentAngle = (j / (segmentCount - 1) - 0.5) * Math.PI * 0.3; // Limit to a 30-degree arc
            const distance = cloudSize * 0.6; // Keep segments close together
            
            // Calculate segment position along the arc
            const x = Math.cos(segmentAngle) * distance;
            const y = Math.sin(segmentAngle) * distance * 0.5; // Flatten vertically
            
            // Randomize segment size slightly
            const size = cloudSize * (0.5 + Math.random() * 0.5);
            
            segments.push({
                x: x,
                y: y,
                size: size,
                opacity: opacity * (0.8 + Math.random() * 0.4)
            });
        }
        
        clouds.push({
            angle: angle,
            rotation: rotation,
            size: cloudSize,
            opacity: opacity,
            speed: speed,
            segments: segments,
            // Animation properties
            pulseSpeed: Math.random() * 0.01 + 0.005,
            pulseAmount: Math.random() * 0.05 + 0.02,
            pulseOffset: Math.random() * Math.PI * 2
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
 * Updates cloud positions and animations
 * @param {Array} clouds - Array of cloud objects
 * @param {number} gameTime - Current game time for animations
 */
function updateClouds(clouds, gameTime) {
    clouds.forEach(cloud => {
        // Update position
        cloud.angle += cloud.speed;
        
        // Keep angle within 0-2π range to avoid floating point issues over time
        if (cloud.angle > Math.PI * 2) {
            cloud.angle -= Math.PI * 2;
        }
        
        // Add subtle pulsing animation based on game time
        cloud.currentPulse = Math.sin(gameTime * cloud.pulseSpeed + cloud.pulseOffset) * cloud.pulseAmount;
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
    
    // Draw clouds that follow Earth's curvature
    ctx.globalCompositeOperation = 'lighter';
    clouds.forEach(cloud => {
        // Position cloud just above Earth's surface
        const cloudDistance = radius + atmosphereWidth * 0.1; // Very close to surface
        const cloudAngle = cloud.angle;
        
        // Calculate cloud center position
        const cloudCenterX = x + Math.cos(cloudAngle) * cloudDistance;
        const cloudCenterY = y + Math.sin(cloudAngle) * cloudDistance;
        
        // Apply pulsing animation
        const pulseScale = 1 + cloud.currentPulse;
        
        // Draw each cloud segment to create a cloud that follows the curve
        cloud.segments.forEach(segment => {
            // Calculate segment position relative to cloud center
            // We need to rotate the segment position based on the cloud's angle around Earth
            const rotatedX = segment.x * Math.cos(cloudAngle + Math.PI/2) - segment.y * Math.sin(cloudAngle + Math.PI/2);
            const rotatedY = segment.x * Math.sin(cloudAngle + Math.PI/2) + segment.y * Math.cos(cloudAngle + Math.PI/2);
            
            // Calculate final segment position
            const segmentX = cloudCenterX + rotatedX;
            const segmentY = cloudCenterY + rotatedY;
            
            // Calculate distance from Earth center for this segment
            const distFromCenter = Math.sqrt(
                Math.pow(segmentX - x, 2) + 
                Math.pow(segmentY - y, 2)
            );
            
            // Adjust segment size based on distance from Earth center
            // This ensures segments farther from Earth are smaller
            const sizeAdjust = cloudDistance / distFromCenter;
            const adjustedSize = segment.size * pulseScale * sizeAdjust;
            
            // Create a soft gradient for each segment
            const segmentGradient = ctx.createRadialGradient(
                segmentX, segmentY, 0,
                segmentX, segmentY, adjustedSize
            );
            segmentGradient.addColorStop(0, `rgba(255, 255, 255, ${segment.opacity})`);
            segmentGradient.addColorStop(0.7, `rgba(255, 255, 255, ${segment.opacity * 0.7})`);
            segmentGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.fillStyle = segmentGradient;
            
            // Draw segment
            ctx.beginPath();
            ctx.arc(segmentX, segmentY, adjustedSize, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    
    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';
}

// Export functions to window
window.createClouds = createClouds;
window.createWaterTwinkles = createWaterTwinkles;
window.updateClouds = updateClouds;
window.drawEarth = drawEarth;
