/**
 * Draws the Sun with corona, rays, and dynamic glow effects
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} gameTime - Current game time for animations
 */
function drawSun(ctx, gameTime) {
    const sun = CELESTIAL_BODIES.SUN;
    const x = sun.position.x;
    const y = sun.position.y;
    const radius = sun.radius;
    
    // Extended corona
    const coronaGradient = ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 2);
    coronaGradient.addColorStop(0, 'rgba(255, 255, 0, 0.3)');
    coronaGradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.2)');
    coronaGradient.addColorStop(0.6, 'rgba(255, 69, 0, 0.1)');
    coronaGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = coronaGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Dynamic surface gradient
    const surfaceGradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius);
    surfaceGradient.addColorStop(0, '#fff5c0');
    surfaceGradient.addColorStop(0.5, '#ffd700');
    surfaceGradient.addColorStop(1, '#ff8c00');
    
    ctx.fillStyle = surfaceGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw animated sun rays
    const numRays = 12;
    const rayPhaseOffset = gameTime * 0.5; // Slower phase animation
    
    ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.lineWidth = 5;
    
    for (let i = 0; i < numRays; i++) {
        const angle = (i * Math.PI / 6) + rayPhaseOffset;
        const rayLength = radius * (0.8 + 0.2 * Math.sin(gameTime * 2 + i)); // Pulsing ray length
        
        // Main ray
        ctx.beginPath();
        ctx.moveTo(
            x + Math.cos(angle) * radius * 1.2,
            y + Math.sin(angle) * radius * 1.2
        );
        ctx.lineTo(
            x + Math.cos(angle) * (radius * 1.2 + rayLength),
            y + Math.sin(angle) * (radius * 1.2 + rayLength)
        );
        ctx.stroke();
        
        // Secondary rays
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.15)';
        
        const subRayAngle1 = angle + 0.1;
        const subRayAngle2 = angle - 0.1;
        const subRayLength = rayLength * 0.7;
        
        ctx.beginPath();
        ctx.moveTo(
            x + Math.cos(subRayAngle1) * radius * 1.2,
            y + Math.sin(subRayAngle1) * radius * 1.2
        );
        ctx.lineTo(
            x + Math.cos(subRayAngle1) * (radius * 1.2 + subRayLength),
            y + Math.sin(subRayAngle1) * (radius * 1.2 + subRayLength)
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(
            x + Math.cos(subRayAngle2) * radius * 1.2,
            y + Math.sin(subRayAngle2) * radius * 1.2
        );
        ctx.lineTo(
            x + Math.cos(subRayAngle2) * (radius * 1.2 + subRayLength),
            y + Math.sin(subRayAngle2) * (radius * 1.2 + subRayLength)
        );
        ctx.stroke();
    }
    
    // Draw surface details (solar granulation effect)
    const granulationAlpha = 0.1;
    const granulationSize = radius * 0.1;
    ctx.fillStyle = `rgba(255, 255, 255, ${granulationAlpha})`;
    
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius * 0.8;
        const size = Math.random() * granulationSize + granulationSize * 0.5;
        
        ctx.beginPath();
        ctx.arc(
            x + Math.cos(angle) * distance,
            y + Math.sin(angle) * distance,
            size,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// Export the drawing function
window.drawSun = drawSun;
