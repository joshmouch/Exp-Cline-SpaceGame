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
        // Create a cloud with 3-5 puffs
        const numPuffs = Math.floor(Math.random() * 3) + 3;
        const puffs = [];
        const cloudWidth = Math.random() * 40 + 30;
        
        // Create puffs in a more natural clustered arrangement
        const centerX = 0;
        const centerY = 0;
        const maxRadius = cloudWidth * 0.3;

        // Create main cluster of puffs
        for (let j = 0; j < numPuffs; j++) {
            const angle = (j / numPuffs) * Math.PI * 2;
            const distance = Math.random() * cloudWidth * 0.3;
            const puffX = centerX + Math.cos(angle) * distance;
            const puffY = centerY + Math.sin(angle) * distance;
            
            // Varied sizes with larger central puffs
            const distanceFromCenter = Math.sqrt(puffX * puffX + puffY * puffY);
            const sizeVariation = 1 - (distanceFromCenter / (cloudWidth * 0.5));
            const radius = (Math.random() * 6 + 10) * (0.7 + sizeVariation * 0.5);
            
            puffs.push({
                offsetX: puffX,
                offsetY: puffY,
                radius: radius,
                opacity: 0.7 + Math.random() * 0.3
            });
        }

        // Add some smaller detail puffs
        const detailPuffs = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < detailPuffs; j++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * cloudWidth * 0.4;
            puffs.push({
                offsetX: centerX + Math.cos(angle) * distance,
                offsetY: centerY + Math.sin(angle) * distance,
                radius: Math.random() * 5 + 5,
                opacity: 0.5 + Math.random() * 0.3
            });
        }
        
        clouds.push({
            angle: Math.random() * Math.PI * 2,
            speed: (Math.random() * 0.0001 + 0.00005) * (Math.random() > 0.5 ? 1 : -1), // Even slower for smoother movement
            puffs: puffs
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
