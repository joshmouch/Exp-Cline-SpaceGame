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
    
    // Draw animated sun rays
    const numRays = 12;
    const rayPhaseOffset = gameTime * 0.5;
    
    // Main rays
    ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.lineWidth = 5;
    
    for (let i = 0; i < numRays; i++) {
        const angle = (i * Math.PI / 6) + rayPhaseOffset;
        const rayLength = radius * (0.8 + 0.2 * Math.sin(gameTime * 2 + i));
        
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
    
    // Draw surface details (solar granulation)
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

/**
 * Draws Venus's swirling cloud patterns
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the planet center
 * @param {number} y - Y coordinate of the planet center
 * @param {number} radius - Radius of the planet
 */
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

// Export all drawing functions to the window object
window.drawMoon = drawMoon;
window.drawSun = drawSun;
window.drawPlanet = drawPlanet;
window.drawPlanets = drawPlanets;
window.drawEarth = drawEarth;
window.createStars = createStars;
window.createClouds = createClouds;
window.createWaterTwinkles = createWaterTwinkles;
window.updateClouds = updateClouds;
