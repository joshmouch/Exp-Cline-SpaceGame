/**
 * Draws the Moon with craters and a subtle glow
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function drawMoon(ctx) {
    const moon = CELESTIAL_BODIES.MOON;
    const { position: { x, y }, radius } = moon;
    
    // Draw subtle moon glow
    const glowGradient = createBodyGradient(ctx, moon, 0.8, 1.2, [
        { offset: 0, color: 'rgba(255, 255, 255, 0.1)' },
        { offset: 1, color: 'rgba(255, 255, 255, 0)' }
    ]);
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon base
    drawBasicBody(ctx, moon);
    
    // Add surface texture
    const surfaceGradient = createPlanetShading(ctx, moon);
    surfaceGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    surfaceGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    
    ctx.fillStyle = surfaceGradient;
    drawBasicBody(ctx, moon);
    
    // Draw craters
    ctx.fillStyle = '#9ca3af';
    drawCrater(ctx, x - radius * 0.3, y - radius * 0.2, radius * 0.15);
    drawCrater(ctx, x + radius * 0.4, y + radius * 0.3, radius * 0.2);
    drawCrater(ctx, x - radius * 0.1, y + radius * 0.4, radius * 0.1);
    drawCrater(ctx, x + radius * 0.2, y - radius * 0.4, radius * 0.12);
}

/**
 * Draws a crater on the Moon with enhanced shading
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the crater center
 * @param {number} y - Y coordinate of the crater center
 * @param {number} radius - Radius of the crater
 */
function drawCrater(ctx, x, y, radius) {
    // Crater shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater surface
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater highlight
    const highlight = ctx.createRadialGradient(
        x - radius * 0.2, y - radius * 0.2, 0,
        x, y, radius
    );
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Export functions to window
window.drawMoon = drawMoon;
