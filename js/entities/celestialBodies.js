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
 * Creates a shading gradient for planets
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object
 * @param {Object} options - Optional gradient parameters
 */
function createPlanetShading(ctx, planet, options = {}) {
    const {
        offsetX = 0.3,
        offsetY = 0.3,
        innerRadius = 0,
        outerRadius = 1,
        highlights = 'rgba(255, 255, 255, 0.3)',
        shadows = 'rgba(0, 0, 0, 0.5)'
    } = options;

    const gradient = ctx.createRadialGradient(
        planet.position.x - planet.radius * offsetX,
        planet.position.y - planet.radius * offsetY,
        planet.radius * innerRadius,
        planet.position.x,
        planet.position.y,
        planet.radius * outerRadius
    );
    
    gradient.addColorStop(0, highlights);
    gradient.addColorStop(1, shadows);
    
    return gradient;
}

/**
 * Creates an atmospheric effect for a planet
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object
 * @param {string} atmosphereColor - Base color of the atmosphere
 * @param {number} width - Width of the atmosphere relative to planet radius
 */
function createAtmosphere(ctx, planet, atmosphereColor, width = 0.2) {
    const atmosphereGradient = createBodyGradient(ctx, planet, 1, 1 + width, [
        { offset: 0, color: atmosphereColor },
        { offset: 1, color: 'rgba(255, 255, 255, 0)' }
    ]);
    
    ctx.fillStyle = atmosphereGradient;
    drawBasicBody(ctx, { position: planet.position, radius: planet.radius * (1 + width) });
}

/**
 * Gets the atmospheric color for a gas giant
 * @param {string} planetName - Name of the planet
 * @returns {string} RGBA color string
 */
function getGasGiantAtmosphereColor(planetName) {
    const colors = {
        jupiter: 'rgba(255, 223, 186, 0.2)', // Jupiter's warmer atmosphere
        saturn: 'rgba(255, 241, 186, 0.2)',  // Saturn's lighter atmosphere
        uranus: 'rgba(170, 255, 240, 0.2)',  // Uranus's cyan atmosphere
        neptune: 'rgba(100, 180, 255, 0.2)'  // Neptune's blue atmosphere
    };
    return colors[planetName] || 'rgba(255, 255, 255, 0.2)';
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
    ctx.fillStyle = createBodyGradient(ctx, sun, 0.8, 2, [
        { offset: 0, color: 'rgba(255, 255, 0, 0.3)' },
        { offset: 0.3, color: 'rgba(255, 165, 0, 0.2)' },
        { offset: 0.6, color: 'rgba(255, 69, 0, 0.1)' },
        { offset: 1, color: 'rgba(255, 0, 0, 0)' }
    ]);
    drawBasicBody(ctx, { position: sun.position, radius: radius * 2 });
    
    // Dynamic surface gradient
    ctx.fillStyle = createBodyGradient(ctx, sun, 0.5, 1, [
        { offset: 0, color: '#fff5c0' },
        { offset: 0.5, color: '#ffd700' },
        { offset: 1, color: '#ff8c00' }
    ]);
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
 * Draws a planet with atmosphere, surface details, and shading
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object from CELESTIAL_BODIES
 */
function drawPlanet(ctx, planet) {
    const { name } = planet;
    
    // Create atmospheric glow for gas giants
    if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(name)) {
        createAtmosphere(ctx, planet, getGasGiantAtmosphereColor(name));
    }
    
    // Draw base planet
    drawBasicBody(ctx, planet);
    
    // Add shading
    ctx.fillStyle = createPlanetShading(ctx, planet);
    drawBasicBody(ctx, planet);
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
 * Draws Uranus's surface with subtle bands and a tilted axis
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the planet center
 * @param {number} y - Y coordinate of the planet center
 * @param {number} radius - Radius of the planet
 */
function drawUranusSurface(ctx, x, y, radius) {
    // Uranus has a unique feature - its axis is tilted almost 90 degrees
    // Draw subtle bands perpendicular to the tilted axis
    const numBands = 5;
    const bandWidth = radius * 2 / numBands;
    
    // Uranus's axis is tilted nearly 90 degrees
    const tiltAngle = Math.PI / 2.2;
    
    for (let i = 0; i < numBands; i++) {
        const offset = -radius + i * bandWidth;
        const alpha = i % 2 === 0 ? 0.05 : 0.1;
        
        // Save the current context state
        ctx.save();
        
        // Translate to the planet center, rotate, and translate back
        ctx.translate(x, y);
        ctx.rotate(tiltAngle);
        ctx.translate(-x, -y);
        
        // Draw the band
        ctx.fillStyle = `rgba(170, 255, 240, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(x, y + offset, radius, bandWidth / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Restore the context state
        ctx.restore();
    }
    
    // Add subtle cloud-like features
    for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 0.4;
        const distance = radius * 0.7;
        const cloudSize = radius * 0.2;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(
            x + Math.cos(angle) * distance,
            y + Math.sin(angle) * distance,
            cloudSize,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

/**
 * Draws Neptune's surface with dynamic storm features
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the planet center
 * @param {number} y - Y coordinate of the planet center
 * @param {number} radius - Radius of the planet
 */
function drawNeptuneSurface(ctx, x, y, radius) {
    // Draw bands similar to Jupiter but with blue tones
    const numBands = 5;
    const bandWidth = radius * 2 / numBands;
    
    for (let i = 0; i < numBands; i++) {
        const yOffset = -radius + i * bandWidth;
        const alpha = i % 2 === 0 ? 0.1 : 0.15;
        
        ctx.fillStyle = `rgba(100, 180, 255, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(x, y + yOffset, radius, bandWidth / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add Great Dark Spot (similar to Jupiter's Great Red Spot but darker)
    ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + radius * 0.3, y - radius * 0.2, radius * 0.25, radius * 0.15, Math.PI * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Add smaller storm features
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x - radius * 0.4, y + radius * 0.3, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(150, 200, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(x + radius * 0.1, y - radius * 0.5, radius * 0.12, 0, Math.PI * 2);
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
        CELESTIAL_BODIES.SATURN,
        CELESTIAL_BODIES.URANUS,
        CELESTIAL_BODIES.NEPTUNE
    ];
    
    planets.forEach(planet => drawPlanet(ctx, planet));
}

/**
 * Draws a planet with atmosphere, surface details, and shading
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object from CELESTIAL_BODIES
 */
function drawPlanet(ctx, planet) {
    const { position: { x, y }, radius, name } = planet;
    
    // Create atmospheric glow for gas giants (Jupiter, Saturn, Uranus, Neptune)
    if (name === 'jupiter' || name === 'saturn' || name === 'uranus' || name === 'neptune') {
        const atmosphereWidth = radius * 0.2;
        let atmosphereColor;
        
        switch (name) {
            case 'jupiter':
                atmosphereColor = 'rgba(255, 223, 186, 0.2)'; // Jupiter's warmer atmosphere
                break;
            case 'saturn':
                atmosphereColor = 'rgba(255, 241, 186, 0.2)'; // Saturn's lighter atmosphere
                break;
            case 'uranus':
                atmosphereColor = 'rgba(170, 255, 240, 0.2)'; // Uranus's cyan atmosphere
                break;
            case 'neptune':
                atmosphereColor = 'rgba(100, 180, 255, 0.2)'; // Neptune's blue atmosphere
                break;
        }
        
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
        case 'uranus':
            drawUranusSurface(ctx, x, y, radius);
            break;
        case 'neptune':
            drawNeptuneSurface(ctx, x, y, radius);
            break;
    }
}

// Export utility functions first
window.createBodyGradient = createBodyGradient;
window.drawBasicBody = drawBasicBody;
window.createPlanetShading = createPlanetShading;

// Export drawing functions
window.drawSun = drawSun;
window.drawPlanet = drawPlanet;
window.drawPlanets = drawPlanets;
