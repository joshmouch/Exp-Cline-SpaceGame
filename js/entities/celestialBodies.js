/**
 * Draws a basic celestial body
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} body - The celestial body object
 * @param {string} fillStyle - Fill style for the body
 */
function drawBasicBody(ctx, body, fillStyle) {
    ctx.fillStyle = fillStyle || body.color;
    ctx.beginPath();
    ctx.arc(body.position.x, body.position.y, body.radius, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Creates a radial gradient for celestial bodies
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} body - The celestial body object
 * @param {number} innerRadius - Inner radius multiplier
 * @param {number} outerRadius - Outer radius multiplier
 * @param {Array<Object>} colorStops - Array of {offset, color} objects
 */
function createBodyGradient(ctx, body, innerRadius, outerRadius, colorStops) {
    const gradient = ctx.createRadialGradient(
        body.position.x, body.position.y, body.radius * innerRadius,
        body.position.x, body.position.y, body.radius * outerRadius
    );
    colorStops.forEach(stop => {
        gradient.addColorStop(stop.offset, stop.color);
    });
    return gradient;
}

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

/**
 * Draws the Sun with corona, rays, and dynamic effects
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} gameTime - Current game time for animations
 */
function drawSun(ctx, gameTime) {
    const sun = CELESTIAL_BODIES.SUN;
    const { position: { x, y }, radius } = sun;
    
    // Extended corona
    const coronaGradient = createBodyGradient(ctx, sun, 0.8, 2, [
        { offset: 0, color: 'rgba(255, 255, 0, 0.3)' },
        { offset: 0.3, color: 'rgba(255, 165, 0, 0.2)' },
        { offset: 0.6, color: 'rgba(255, 69, 0, 0.1)' },
        { offset: 1, color: 'rgba(255, 0, 0, 0)' }
    ]);
    
    ctx.fillStyle = coronaGradient;
    drawBasicBody(ctx, { position: sun.position, radius: radius * 2 });
    
    // Dynamic surface gradient
    const surfaceGradient = createBodyGradient(ctx, sun, 0.5, 1, [
        { offset: 0, color: '#fff5c0' },
        { offset: 0.5, color: '#ffd700' },
        { offset: 1, color: '#ff8c00' }
    ]);
    
    ctx.fillStyle = surfaceGradient;
    drawBasicBody(ctx, sun);
    
    // Draw animated sun rays - MUCH slower rotation
    const numRays = 12;
    const rayPhaseOffset = gameTime * 0.05; // 10x slower
    
    // Main rays
    ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.lineWidth = 5;
    
    for (let i = 0; i < numRays; i++) {
        const angle = (i * Math.PI / 6) + rayPhaseOffset;
        const rayLength = radius * (0.8 + 0.2 * Math.sin(gameTime * 0.2 + i)); // 10x slower pulsing
        
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
        
        // Draw sub-rays
        [subRayAngle1, subRayAngle2].forEach(subAngle => {
            ctx.beginPath();
            ctx.moveTo(
                x + Math.cos(subAngle) * radius * 1.2,
                y + Math.sin(subAngle) * radius * 1.2
            );
            ctx.lineTo(
                x + Math.cos(subAngle) * (radius * 1.2 + subRayLength),
                y + Math.sin(subAngle) * (radius * 1.2 + subRayLength)
            );
            ctx.stroke();
        });
    }
    
    // Draw surface details (solar granulation) - fixed positions instead of random
    // This prevents the "spinning dots" effect
    const granulationAlpha = 0.1;
    const granulationSize = radius * 0.1;
    ctx.fillStyle = `rgba(255, 255, 255, ${granulationAlpha})`;
    
    // Use fixed positions based on a seed
    const seed = Math.floor(gameTime * 0.01); // Change very slowly
    
    // Create a deterministic pattern that changes very slowly
    for (let i = 0; i < 20; i++) {
        // Use fixed angles based on index
        const angle = (i / 20) * Math.PI * 2 + (seed * 0.01);
        const distance = (0.3 + (i % 5) * 0.1) * radius; // Distribute in rings
        const size = ((i % 3) + 1) * granulationSize * 0.3;
        
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

/**
 * Creates a shading gradient for planets
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object
 */
function createPlanetShading(ctx, planet) {
    return ctx.createRadialGradient(
        planet.position.x - planet.radius * 0.3,
        planet.position.y - planet.radius * 0.3,
        0,
        planet.position.x,
        planet.position.y,
        planet.radius
    );
}

/**
 * Draws a planet with atmosphere, surface details, and shading
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object from CELESTIAL_BODIES
 */
function drawPlanet(ctx, planet) {
    const { position: { x, y }, radius, name } = planet;
    
    // Create atmospheric glow for gas giants (Jupiter and Saturn)
    if (name === 'jupiter' || name === 'saturn') {
        const atmosphereWidth = radius * 0.2;
        const atmosphereColor = name === 'jupiter' ? 
            'rgba(255, 223, 186, 0.2)' : // Jupiter's warmer atmosphere
            'rgba(255, 241, 186, 0.2)';  // Saturn's lighter atmosphere
        
        const atmosphereGradient = createBodyGradient(ctx, planet, 1, 1.2, [
            { offset: 0, color: atmosphereColor },
            { offset: 1, color: 'rgba(255, 255, 255, 0)' }
        ]);
        
        ctx.fillStyle = atmosphereGradient;
        drawBasicBody(ctx, { position: planet.position, radius: radius + atmosphereWidth });
    }
    
    // Draw base planet
    drawBasicBody(ctx, planet);
    
    // Add shading
    const shadingGradient = createPlanetShading(ctx, planet);
    shadingGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    shadingGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    
    ctx.fillStyle = shadingGradient;
    drawBasicBody(ctx, planet);
    
    // Add surface details based on planet type
    switch (name) {
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

/**
 * Draws Mercury's cratered surface
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the planet center
 * @param {number} y - Y coordinate of the planet center
 * @param {number} radius - Radius of the planet
 */
function drawMercurySurface(ctx, x, y, radius) {
    // Add crater-like texture with fixed positions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    
    // Use fixed crater positions
    const craterPositions = [
        { angle: 0.2, dist: 0.3, size: 0.15 },
        { angle: 1.1, dist: 0.5, size: 0.25 },
        { angle: 2.3, dist: 0.7, size: 0.12 },
        { angle: 3.6, dist: 0.4, size: 0.18 },
        { angle: 4.2, dist: 0.6, size: 0.14 },
        { angle: 5.1, dist: 0.3, size: 0.22 },
        { angle: 5.8, dist: 0.7, size: 0.16 },
        { angle: 0.8, dist: 0.8, size: 0.13 }
    ];
    
    craterPositions.forEach(crater => {
        const craterX = x + Math.cos(crater.angle) * radius * crater.dist;
        const craterY = y + Math.sin(crater.angle) * radius * crater.dist;
        const craterSize = radius * crater.size;
        
        ctx.beginPath();
        ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
        ctx.fill();
    });
}


/**
 * Draws Venus's swirling cloud patterns
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the planet center
 * @param {number} y - Y coordinate of the planet center
 * @param {number} radius - Radius of the planet
 */
function drawVenusSurface(ctx, x, y, radius) {
    // Base surface gradient
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
    
    // Venus has thick yellowish clouds - use the global VENUS_CLOUDS from clouds.js
    if (typeof VENUS_CLOUDS !== 'undefined') {
        // Update Venus clouds
        updateClouds(VENUS_CLOUDS, Date.now() / 1000);
        
        // Draw Venus clouds
        drawClouds(ctx, { position: { x, y }, radius }, VENUS_CLOUDS);
    }
}

/**
 * Draws Mars's surface with polar caps and canyons
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the planet center
 * @param {number} y - Y coordinate of the planet center
 * @param {number} radius - Radius of the planet
 */
function drawMarsSurface(ctx, x, y, radius) {
    // Add polar ice caps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y - radius * 0.8, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.8, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Add surface features suggesting canyons with fixed positions
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = 2;
    
    // Fixed canyon positions
    const canyons = [
        { startAngle: 0.3, arcLength: 0.8, distFactor: 0.7 },
        { startAngle: 1.5, arcLength: 0.6, distFactor: 0.6 },
        { startAngle: 2.8, arcLength: 0.4, distFactor: 0.8 },
        { startAngle: 4.2, arcLength: 0.7, distFactor: 0.5 },
        { startAngle: 5.5, arcLength: 0.5, distFactor: 0.7 }
    ];
    
    canyons.forEach(canyon => {
        ctx.beginPath();
        ctx.arc(
            x, y, 
            radius * canyon.distFactor, 
            canyon.startAngle, 
            canyon.startAngle + canyon.arcLength
        );
        ctx.stroke();
    });
}

/**
 * Draws Jupiter's banded surface and Great Red Spot
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the planet center
 * @param {number} y - Y coordinate of the planet center
 * @param {number} radius - Radius of the planet
 */
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

/**
 * Draws Saturn's banded surface and rings
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the planet center
 * @param {number} y - Y coordinate of the planet center
 * @param {number} radius - Radius of the planet
 */
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



// Export all drawing functions to the window object
window.drawMoon = drawMoon;
window.drawSun = drawSun;
window.drawPlanet = drawPlanet;
window.drawPlanets = drawPlanets;
