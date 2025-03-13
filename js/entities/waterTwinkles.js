/**
 * Creates an array of water twinkle objects for Earth's oceans
 * @param {number} count - Number of twinkles to create
 * @returns {Array} Array of water twinkle objects
 */
function createWaterTwinkles(count) {
    const twinkles = [];
    
    for (let i = 0; i < count; i++) {
        twinkles.push({
            angle: Math.random() * Math.PI * 2,
            latitude: Math.random() * Math.PI - Math.PI / 2,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
    
    return twinkles;
}

/**
 * Draws water twinkles on Earth's oceans
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} earth - The Earth object from CELESTIAL_BODIES
 * @param {Array} waterTwinkles - Array of water twinkle objects
 * @param {number} gameTime - Current game time for animations
 */
function drawWaterTwinkles(ctx, earth, waterTwinkles, gameTime) {
    const { position: { x, y }, radius } = earth;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    waterTwinkles.forEach(twinkle => {
        const twinkleX = x + Math.cos(twinkle.angle) * Math.cos(twinkle.latitude) * radius;
        const twinkleY = y + Math.sin(twinkle.angle) * Math.cos(twinkle.latitude) * radius;
        const twinkleSize = 1 + 0.5 * Math.sin(gameTime * twinkle.twinkleSpeed + twinkle.twinkleOffset);
        
        ctx.beginPath();
        ctx.arc(twinkleX, twinkleY, twinkleSize, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Export functions to window
window.createWaterTwinkles = createWaterTwinkles;
window.drawWaterTwinkles = drawWaterTwinkles;
