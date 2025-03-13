/**
 * Draws a planet with atmosphere and surface details
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object from CELESTIAL_BODIES
 */
function drawPlanet(ctx, planet) {
    const x = planet.position.x;
    const y = planet.position.y;
    const radius = planet.radius;
    
    // Create atmospheric glow for gas giants (Jupiter and Saturn)
    if (planet.name === 'jupiter' || planet.name === 'saturn') {
        const atmosphereWidth = radius * 0.2;
        const atmosphereGradient = ctx.createRadialGradient(
            x, y, radius,
            x, y, radius + atmosphereWidth
        );
        
        // Customize atmosphere color based on planet
        const atmosphereColor = planet.name === 'jupiter' ? 
            'rgba(255, 223, 186, 0.2)' : // Jupiter's warmer atmosphere
            'rgba(255, 241, 186, 0.2)';  // Saturn's lighter atmosphere
        
        atmosphereGradient.addColorStop(0, atmosphereColor);
        atmosphereGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = atmosphereGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius + atmosphereWidth, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Planet base
    ctx.fillStyle = planet.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add surface details based on planet type
    switch (planet.name) {
        case 'mercury':
            drawMercurySurface(ctx, x, y, radius);
            break;
        case 'venus':
            drawVenusSurface(ctx, x, y, radius);
            break;
        case 'mars':
            drawMarsSurface(ctx, x, y, radius);
            break;
        case 'jupiter':
            drawJupiterSurface(ctx, x, y, radius);
            break;
        case 'saturn':
            drawSaturnSurface(ctx, x, y, radius);
            break;
    }
}

function drawMercurySurface(ctx, x, y, radius) {
    // Add crater-like texture
    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius * 0.8;
        const size = Math.random() * radius * 0.2 + radius * 0.1;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
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

function drawVenusSurface(ctx, x, y, radius) {
    // Add swirling cloud patterns
    const gradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(0.5, 'rgba(255, 198, 145, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawMarsSurface(ctx, x, y, radius) {
    // Add polar ice caps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y - radius * 0.8, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.8, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Add surface features suggesting canyons
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const startAngle = Math.random() * Math.PI * 2;
        const arcLength = Math.random() * Math.PI * 0.5;
        
        ctx.beginPath();
        ctx.arc(x, y, radius * (0.5 + Math.random() * 0.4), startAngle, startAngle + arcLength);
        ctx.stroke();
    }
}

function drawJupiterSurface(ctx, x, y, radius) {
    // Draw bands
    const numBands = 7;
    const bandWidth = radius * 2 / numBands;
    
    for (let i = 0; i < numBands; i++) {
        const yOffset = -radius + i * bandWidth;
        const alpha = i % 2 === 0 ? 0.1 : 0.2;
        
        ctx.fillStyle = `rgba(255, 223, 186, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(x, y + yOffset, radius, bandWidth / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add Great Red Spot
    ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x - radius * 0.2, y, radius * 0.3, radius * 0.15, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

function drawSaturnSurface(ctx, x, y, radius) {
    // Draw bands similar to Jupiter but with different colors
    const numBands = 6;
    const bandWidth = radius * 2 / numBands;
    
    for (let i = 0; i < numBands; i++) {
        const yOffset = -radius + i * bandWidth;
        const alpha = i % 2 === 0 ? 0.1 : 0.15;
        
        ctx.fillStyle = `rgba(255, 241, 186, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(x, y + yOffset, radius, bandWidth / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw rings
    const ringGradient = ctx.createLinearGradient(
        x - radius * 2, y,
        x + radius * 2, y
    );
    ringGradient.addColorStop(0, 'rgba(255, 241, 186, 0)');
    ringGradient.addColorStop(0.2, 'rgba(255, 241, 186, 0.2)');
    ringGradient.addColorStop(0.5, 'rgba(255, 241, 186, 0.3)');
    ringGradient.addColorStop(0.8, 'rgba(255, 241, 186, 0.2)');
    ringGradient.addColorStop(1, 'rgba(255, 241, 186, 0)');
    
    ctx.fillStyle = ringGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 2, radius * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draws all planets in the solar system
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function drawPlanets(ctx) {
    const planets = [
        CELESTIAL_BODIES.MERCURY,
        CELESTIAL_BODIES.VENUS,
        CELESTIAL_BODIES.MARS,
        CELESTIAL_BODIES.JUPITER,
        CELESTIAL_BODIES.SATURN
    ];
    
    planets.forEach(planet => drawPlanet(ctx, planet));
}

// Export the drawing functions
window.drawPlanets = drawPlanets;
window.drawPlanet = drawPlanet;
