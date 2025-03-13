/**
 * Draws Earth with land masses, water twinkles, and clouds
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} gameTime - Current game time for animations
 * @param {Array} waterTwinkles - Array of water twinkle objects
 * @param {Array} clouds - Array of cloud objects
 */
function drawEarth(ctx, gameTime, waterTwinkles, clouds) {
    const earth = CELESTIAL_BODIES.EARTH;
    
    // Earth base
    ctx.fillStyle = earth.color;
    ctx.beginPath();
    ctx.arc(earth.position.x, earth.position.y, earth.radius, 0, Math.PI * 2);
    ctx.fill();
    
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
    const earthRadius = earth.radius;
    waterTwinkles.forEach(twinkle => {
        const brightness = 0.5 + 0.5 * Math.sin(gameTime * twinkle.twinkleSpeed + twinkle.twinkleOffset);
        const x = earth.position.x + Math.cos(twinkle.angle) * Math.cos(twinkle.latitude) * earthRadius;
        const y = earth.position.y + Math.sin(twinkle.angle) * Math.cos(twinkle.latitude) * earthRadius;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Clouds
    clouds.forEach(cloud => {
        const x = earth.position.x + Math.cos(cloud.angle) * earthRadius;
        const y = earth.position.y + Math.sin(cloud.angle) * earthRadius;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(x, y, cloud.width, cloud.height, cloud.angle, 0, Math.PI * 2);
        ctx.fill();
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
 * Draws the Moon with craters
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function drawMoon(ctx) {
    const moon = CELESTIAL_BODIES.MOON;
    const x = moon.position.x;
    const y = moon.position.y;
    const radius = moon.radius;
    
    // Moon base
    ctx.fillStyle = moon.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon craters
    ctx.fillStyle = '#9ca3af';
    
    // Draw several craters
    drawCrater(ctx, x - radius * 0.3, y - radius * 0.2, radius * 0.15);
    drawCrater(ctx, x + radius * 0.4, y + radius * 0.3, radius * 0.2);
    drawCrater(ctx, x - radius * 0.1, y + radius * 0.4, radius * 0.1);
    drawCrater(ctx, x + radius * 0.2, y - radius * 0.4, radius * 0.12);
}

/**
 * Draws a crater on the Moon
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - X coordinate of the crater center
 * @param {number} y - Y coordinate of the crater center
 * @param {number} radius - Radius of the crater
 */
function drawCrater(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draws the Sun with rays
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} gameTime - Current game time for animations
 */
function drawSun(ctx, gameTime) {
    const sun = CELESTIAL_BODIES.SUN;
    const x = sun.position.x;
    const y = sun.position.y;
    const radius = sun.radius;
    
    const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.5);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff5c0';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw sun rays
    ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.lineWidth = 5;
    for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6 + gameTime * 0.05;
        const innerRadius = radius * 1.2;
        const outerRadius = radius * 2;
        
        ctx.beginPath();
        ctx.moveTo(
            x + Math.cos(angle) * innerRadius,
            y + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
            x + Math.cos(angle) * outerRadius,
            y + Math.sin(angle) * outerRadius
        );
        ctx.stroke();
    }
}

/**
 * Draws a planet
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} planet - The planet object from CELESTIAL_BODIES
 */
function drawPlanet(ctx, planet) {
    const x = planet.position.x;
    const y = planet.position.y;
    const radius = planet.radius;
    
    ctx.fillStyle = planet.color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add simple shading
    const gradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draws all planets in the solar system
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function drawPlanets(ctx) {
    drawPlanet(ctx, CELESTIAL_BODIES.MERCURY);
    drawPlanet(ctx, CELESTIAL_BODIES.VENUS);
    drawPlanet(ctx, CELESTIAL_BODIES.MARS);
    drawPlanet(ctx, CELESTIAL_BODIES.JUPITER);
    drawPlanet(ctx, CELESTIAL_BODIES.SATURN);
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
        clouds.push({
            angle: Math.random() * Math.PI * 2,
            width: Math.random() * 40 + 20,
            height: Math.random() * 20 + 10,
            speed: (Math.random() * 0.0005 + 0.0002) * (Math.random() > 0.5 ? 1 : -1)
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
    });
}
