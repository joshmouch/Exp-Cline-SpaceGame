// Initial rocket state
const initialRocketState = {
    x: CELESTIAL_BODIES.EARTH.position.x,
    y: CELESTIAL_BODIES.EARTH.position.y - CELESTIAL_BODIES.EARTH.radius - ROCKET_HEIGHT / 2,
    angle: 0, // Pointing upward
    velocity: { x: 0, y: 0 },
    fuel: INITIAL_FUEL,
    accelerating: false,
    landed: true,
    exploded: false
};

/**
 * Creates a new rocket object
 * @returns {Object} A new rocket object
 */
function createRocket() {
    return { ...initialRocketState };
}

/**
 * Draws a rocket with enhanced visuals and effects
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} rocket - The rocket object
 * @param {number} gameTime - Current game time for animations 
 */
function drawRocket(ctx, rocket, gameTime) {
    if (rocket.exploded) {
        drawExplosion(ctx, rocket);
        return;
    }
    
    ctx.save();
    ctx.translate(rocket.x, rocket.y);
    ctx.rotate(rocket.angle - Math.PI / 2); // Adjust to face upward by default
    
    // Draw wings
    ctx.fillStyle = '#d0d0d0';
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(-ROCKET_HEIGHT * 0.4, -ROCKET_WIDTH * 0.5);
    ctx.lineTo(-ROCKET_HEIGHT * 0.5, -ROCKET_WIDTH * 1.2);
    ctx.lineTo(-ROCKET_HEIGHT * 0.3, -ROCKET_WIDTH * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(-ROCKET_HEIGHT * 0.4, ROCKET_WIDTH * 0.5);
    ctx.lineTo(-ROCKET_HEIGHT * 0.5, ROCKET_WIDTH * 1.2);
    ctx.lineTo(-ROCKET_HEIGHT * 0.3, ROCKET_WIDTH * 0.5);
    ctx.closePath();
    ctx.fill();
    
    // Draw rocket body
    const bodyGradient = ctx.createLinearGradient(
        -ROCKET_HEIGHT / 2, 0,
        ROCKET_HEIGHT / 2, 0
    );
    bodyGradient.addColorStop(0, '#e0e0e0');
    bodyGradient.addColorStop(0.3, '#ffffff');
    bodyGradient.addColorStop(1, '#e0e0e0');
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(ROCKET_HEIGHT / 2, 0);
    ctx.lineTo(-ROCKET_HEIGHT / 2, -ROCKET_WIDTH / 2);
    ctx.lineTo(-ROCKET_HEIGHT / 2, ROCKET_WIDTH / 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw cockpit
    ctx.fillStyle = '#add8e6';  // Light blue
    ctx.beginPath();
    ctx.arc(ROCKET_HEIGHT * 0.2, 0, ROCKET_WIDTH * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw cockpit highlight
    const cockpitGradient = ctx.createRadialGradient(
        ROCKET_HEIGHT * 0.15, -ROCKET_WIDTH * 0.1, 0,
        ROCKET_HEIGHT * 0.2, 0, ROCKET_WIDTH * 0.3
    );
    cockpitGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    cockpitGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = cockpitGradient;
    ctx.beginPath();
    ctx.arc(ROCKET_HEIGHT * 0.2, 0, ROCKET_WIDTH * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw engine exhaust when accelerating
    if (rocket.accelerating && rocket.fuel > 0 && !rocket.landed) {
        const flickerIntensity = 0.2;
        const flicker = 1 + flickerIntensity * (Math.sin(gameTime * 30) + Math.sin(gameTime * 20));
        const exhaustLength = ROCKET_HEIGHT * 0.4 * flicker;
        const exhaustWidth = ROCKET_WIDTH * 0.3;
        
        // Create dynamic gradient for engine exhaust
        const exhaustGradient = ctx.createLinearGradient(
            -ROCKET_HEIGHT / 2 - exhaustLength, 0,
            -ROCKET_HEIGHT / 2, 0
        );
        exhaustGradient.addColorStop(0, 'rgba(255, 50, 0, 0)');
        exhaustGradient.addColorStop(0.2, 'rgba(255, 150, 0, ' + (0.4 * flicker) + ')');
        exhaustGradient.addColorStop(1, 'rgba(255, 200, 0, ' + (0.8 * flicker) + ')');
        
        // Main exhaust
        ctx.fillStyle = exhaustGradient;
        ctx.beginPath();
        ctx.moveTo(-ROCKET_HEIGHT / 2, exhaustWidth);
        ctx.lineTo(-ROCKET_HEIGHT / 2 - exhaustLength, 0);
        ctx.lineTo(-ROCKET_HEIGHT / 2, -exhaustWidth);
        ctx.closePath();
        ctx.fill();
        
        // Side exhaust trails
        const sideExhaustLength = exhaustLength * 0.7;
        const sideExhaustWidth = exhaustWidth * 0.5;
        const sideExhaustOffset = ROCKET_WIDTH * 0.4;
        
        // Left trail
        ctx.beginPath();
        ctx.moveTo(-ROCKET_HEIGHT / 2, -sideExhaustOffset);
        ctx.lineTo(-ROCKET_HEIGHT / 2 - sideExhaustLength, -sideExhaustOffset - sideExhaustWidth);
        ctx.lineTo(-ROCKET_HEIGHT / 2 - sideExhaustLength * 0.8, -sideExhaustOffset);
        ctx.closePath();
        ctx.fill();
        
        // Right trail
        ctx.beginPath();
        ctx.moveTo(-ROCKET_HEIGHT / 2, sideExhaustOffset);
        ctx.lineTo(-ROCKET_HEIGHT / 2 - sideExhaustLength, sideExhaustOffset + sideExhaustWidth);
        ctx.lineTo(-ROCKET_HEIGHT / 2 - sideExhaustLength * 0.8, sideExhaustOffset);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

/**
 * Draws explosion effect when rocket crashes
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} rocket - The rocket object
 */
function drawExplosion(ctx, rocket) {
    // Create explosion gradient
    const gradient = ctx.createRadialGradient(
        rocket.x, rocket.y, 0,
        rocket.x, rocket.y, ROCKET_HEIGHT * 2
    );
    gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.5)');
    gradient.addColorStop(0.6, 'rgba(255, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    // Draw main explosion
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(rocket.x, rocket.y, ROCKET_HEIGHT * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw some debris particles
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = ROCKET_HEIGHT * 1.2;
        
        ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(
            rocket.x + Math.cos(angle) * distance,
            rocket.y + Math.sin(angle) * distance,
            ROCKET_WIDTH * 0.2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

/**
 * Accelerates the rocket
 * @param {Object} rocket - The rocket object
 */
function accelerateRocket(rocket) {
    if (rocket.fuel > 0 && !rocket.exploded) {
        rocket.velocity.x += Math.sin(rocket.angle) * ACCELERATION_RATE;
        rocket.velocity.y -= Math.cos(rocket.angle) * ACCELERATION_RATE;
        rocket.fuel = Math.max(0, rocket.fuel - FUEL_CONSUMPTION_RATE);
        return true;
    }
    return false;
}

/**
 * Launches the rocket from a celestial body
 * @param {Object} rocket - The rocket object
 * @param {Object} body - The celestial body to launch from
 */
function launchRocket(rocket, body) {
    if (rocket.landed && !rocket.exploded && rocket.fuel > 0) {
        rocket.landed = false;
        const launchAngle = rocket.angle;
        const launchDistance = body.radius + ROCKET_HEIGHT / 2 + 1; // +1 to avoid immediate collision
        
        // Calculate position relative to the body
        rocket.x = body.position.x + Math.cos(launchAngle - Math.PI / 2) * launchDistance;
        rocket.y = body.position.y + Math.sin(launchAngle - Math.PI / 2) * launchDistance;
        
        // Add initial velocity in the direction the rocket is pointing
        rocket.velocity.x = Math.sin(rocket.angle) * ACCELERATION_RATE * 10;
        rocket.velocity.y = -Math.cos(rocket.angle) * ACCELERATION_RATE * 10;
        
        console.log(`Launching rocket with velocity: (${rocket.velocity.x}, ${rocket.velocity.y})`);
        return true;
    }
    return false;
}

/**
 * Checks if the rocket can land safely on a celestial body
 * @param {Object} rocket - The rocket object
 * @param {Object} body - The celestial body to land on
 * @param {number} safeVelocity - Maximum safe landing velocity
 * @returns {Object} Landing result with success flag and landing angle
 */
function checkLanding(rocket, body, safeVelocity = SAFE_LANDING_VELOCITY) {
    const dx = body.position.x - rocket.x;
    const dy = body.position.y - rocket.y;
    const distanceToSurface = Math.sqrt(dx * dx + dy * dy);
    
    if (distanceToSurface < body.radius + ROCKET_HEIGHT / 2) {
        const speed = Math.sqrt(rocket.velocity.x * rocket.velocity.x + rocket.velocity.y * rocket.velocity.y);
        const landingAngle = Math.atan2(dy, dx) - Math.PI / 2;
        const angleDifference = Math.abs(normalizeAngle(rocket.angle - landingAngle));
        
        return {
            success: speed < safeVelocity && angleDifference < Math.PI / 4,
            landingAngle: landingAngle,
            landingDistance: body.radius + ROCKET_HEIGHT / 2
        };
    }
    
    return { success: false };
}

// Export functions to window
window.drawRocket = drawRocket;
window.createRocket = createRocket;
window.accelerateRocket = accelerateRocket;
window.launchRocket = launchRocket;
window.checkLanding = checkLanding;
