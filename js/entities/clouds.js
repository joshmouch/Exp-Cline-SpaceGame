/**
 * Creates an array of cloud objects for a planet
 * @param {number} count - Number of clouds to create
 * @param {Object} options - Cloud options
 * @returns {Array} Array of cloud objects
 */
function createClouds(count, options = {}) {
    // Default options
    const defaults = {
        cloudSize: { min: 10, max: 25 },
        opacity: { min: 0.2, max: 0.4 },
        speed: { min: 0.0002, max: 0.0005 },
        segmentCount: { min: 3, max: 5 },
        color: { r: 255, g: 255, b: 255 },
        atmosphereHeight: 0.1 // Relative to planet radius
    };
    
    // Merge defaults with provided options
    const config = { ...defaults, ...options };
    
    const clouds = [];
    
    for (let i = 0; i < count; i++) {
        // Create cloud properties
        const cloudSize = Math.random() * (config.cloudSize.max - config.cloudSize.min) + config.cloudSize.min;
        const opacity = Math.random() * (config.opacity.max - config.opacity.min) + config.opacity.min;
        
        // Random position around planet
        const angle = Math.random() * Math.PI * 2;
        
        // Random rotation of the cloud pattern
        const rotation = Math.random() * Math.PI;
        
        // Random speed (all moving in same direction)
        const speed = Math.random() * (config.speed.max - config.speed.min) + config.speed.min;
        
        // Create cloud segments
        const segmentCount = Math.floor(Math.random() * 
            (config.segmentCount.max - config.segmentCount.min + 1)) + config.segmentCount.min;
        const segments = [];
        
        // Create segments in a curved arrangement
        for (let j = 0; j < segmentCount; j++) {
            // Position segments in an arc to follow planet's curvature
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
            color: config.color,
            // Animation properties
            pulseSpeed: Math.random() * 0.01 + 0.005,
            pulseAmount: Math.random() * 0.05 + 0.02,
            pulseOffset: Math.random() * Math.PI * 2,
            atmosphereHeight: config.atmosphereHeight
        });
    }
    
    return clouds;
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
 * Draws clouds around a planet
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object
 * @param {Array} clouds - Array of cloud objects
 */
function drawClouds(ctx, planet, clouds) {
    const { position: { x, y }, radius } = planet;
    
    // Draw clouds that follow planet's curvature
    ctx.globalCompositeOperation = 'lighter';
    clouds.forEach(cloud => {
        // Position cloud just above planet's surface
        const cloudDistance = radius * (1 + cloud.atmosphereHeight);
        const cloudAngle = cloud.angle;
        
        // Calculate cloud center position
        const cloudCenterX = x + Math.cos(cloudAngle) * cloudDistance;
        const cloudCenterY = y + Math.sin(cloudAngle) * cloudDistance;
        
        // Apply pulsing animation
        const pulseScale = 1 + (cloud.currentPulse || 0);
        
        // Draw each cloud segment to create a cloud that follows the curve
        cloud.segments.forEach(segment => {
            // Calculate segment position relative to cloud center
            // We need to rotate the segment position based on the cloud's angle around planet
            const rotatedX = segment.x * Math.cos(cloudAngle + Math.PI/2) - segment.y * Math.sin(cloudAngle + Math.PI/2);
            const rotatedY = segment.x * Math.sin(cloudAngle + Math.PI/2) + segment.y * Math.cos(cloudAngle + Math.PI/2);
            
            // Calculate final segment position
            const segmentX = cloudCenterX + rotatedX;
            const segmentY = cloudCenterY + rotatedY;
            
            // Calculate distance from planet center for this segment
            const distFromCenter = Math.sqrt(
                Math.pow(segmentX - x, 2) + 
                Math.pow(segmentY - y, 2)
            );
            
            // Adjust segment size based on distance from planet center
            // This ensures segments farther from planet are smaller
            const sizeAdjust = cloudDistance / distFromCenter;
            const adjustedSize = segment.size * pulseScale * sizeAdjust;
            
            // Create a soft gradient for each segment
            const segmentGradient = ctx.createRadialGradient(
                segmentX, segmentY, 0,
                segmentX, segmentY, adjustedSize
            );
            
            // Use the cloud's color
            const { r, g, b } = cloud.color;
            segmentGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${segment.opacity})`);
            segmentGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${segment.opacity * 0.7})`);
            segmentGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
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

// Global variables for persistent clouds
let EARTH_CLOUDS = null;
let VENUS_CLOUDS = null;

// Initialize clouds after the page loads
window.addEventListener('load', () => {
    // Initialize Earth clouds
    EARTH_CLOUDS = createClouds(20, {
        cloudSize: { min: 10, max: 25 },
        opacity: { min: 0.2, max: 0.4 },
        color: { r: 255, g: 255, b: 255 },
        atmosphereHeight: 0.1
    });
    
    // Initialize Venus clouds
    VENUS_CLOUDS = createClouds(15, {
        cloudSize: { min: 15, max: 30 },
        opacity: { min: 0.15, max: 0.25 },
        speed: { min: 0.0001, max: 0.0003 },
        color: { r: 255, g: 240, b: 200 },
        atmosphereHeight: 0.05
    });
});

// Export functions to window
window.createClouds = createClouds;
window.updateClouds = updateClouds;
window.drawClouds = drawClouds;
