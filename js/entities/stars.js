/**
 * Draws stars with enhanced twinkling effect
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array} stars - Array of star objects
 * @param {number} gameTime - Current game time for animations
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} canvasHeight - Height of the canvas
 */
function drawStars(ctx, stars, gameTime, canvasWidth, canvasHeight) {
    // Create a starfield background
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw each star with enhanced effects
    stars.forEach(star => {
        // Calculate position relative to canvas center
        const x = (canvasWidth / 2) + star.x;
        const y = (canvasHeight / 2) + star.y;
        
        // Enhanced twinkling effect with multiple frequencies
        const primaryTwinkle = 0.9 + 0.1 * Math.sin(gameTime * star.twinkleSpeed + star.twinkleOffset);
        const secondaryTwinkle = 0.95 + 0.05 * Math.cos(gameTime * star.twinkleSpeed * 1.5 + star.twinkleOffset * 0.7);
        const combinedTwinkle = primaryTwinkle * secondaryTwinkle;
        
        // Different star colors based on their properties
        let starColor;
        if (star.colorType === 'blue') {
            starColor = `rgba(180, 220, 255, ${combinedTwinkle})`;
        } else if (star.colorType === 'red') {
            starColor = `rgba(255, 180, 180, ${combinedTwinkle})`;
        } else if (star.colorType === 'yellow') {
            starColor = `rgba(255, 255, 180, ${combinedTwinkle})`;
        } else {
            starColor = `rgba(255, 255, 255, ${combinedTwinkle})`;
        }
        
        // Draw star glow
        const glowSize = star.size * (2 + combinedTwinkle);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glow.addColorStop(0, starColor);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw star core
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(x, y, star.size * combinedTwinkle, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw star rays for larger stars
        if (star.size > 1.5) {
            const rayLength = star.size * 4 * combinedTwinkle;
            ctx.strokeStyle = starColor;
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI / 2) + (gameTime * 0.1 * star.twinkleSpeed);
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * rayLength,
                    y + Math.sin(angle) * rayLength
                );
                ctx.stroke();
            }
        }
    });
}

/**
 * Creates an array of star objects with various properties
 * @param {number} count - Number of stars to create
 * @param {number} maxDistance - Maximum distance from center
 * @returns {Array} Array of star objects
 */
function createStars(count, maxDistance = 1000) {
    const stars = [];
    const starColors = ['white', 'blue', 'yellow', 'red'];
    
    for (let i = 0; i < count; i++) {
        // Determine star size with more variation
        const sizeRandom = Math.random();
        let size;
        
        if (sizeRandom > 0.98) {
            // Very large stars (rare)
            size = Math.random() * 1.5 + 3;
        } else if (sizeRandom > 0.9) {
            // Large stars
            size = Math.random() * 0.8 + 2.2;
        } else if (sizeRandom > 0.7) {
            // Medium stars
            size = Math.random() * 0.6 + 1.6;
        } else {
            // Small stars (most common)
            size = Math.random() * 1 + 1;
        }
        
        // Determine star color with realistic distribution
        let colorType;
        const colorRandom = Math.random();
        
        if (colorRandom > 0.9) {
            colorType = 'blue'; // Hot blue stars (rare)
        } else if (colorRandom > 0.7) {
            colorType = 'white'; // White stars
        } else if (colorRandom > 0.3) {
            colorType = 'yellow'; // Yellow stars (common)
        } else {
            colorType = 'red'; // Red stars
        }
        
        // Create star with enhanced properties
        stars.push({
            x: (Math.random() - 0.5) * maxDistance,
            y: (Math.random() - 0.5) * maxDistance,
            size: size,
            twinkleSpeed: Math.random() * 0.08 + 0.02, // Increased twinkle speed range
            twinkleOffset: Math.random() * Math.PI * 2,
            colorType: colorType
        });
    }
    
    return stars;
}

// Export functions to window
window.drawStars = drawStars;
window.createStars = createStars;
