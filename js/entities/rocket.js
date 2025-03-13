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
 * Draws the rocket on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} rocket - The rocket object
 */
function drawRocket(ctx, rocket) {
    if (!rocket.exploded) {
        ctx.save();
        ctx.translate(rocket.x, rocket.y);
        ctx.rotate(rocket.angle);
        
        // Rocket body
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.moveTo(0, -ROCKET_HEIGHT / 2);
        ctx.lineTo(ROCKET_WIDTH / 2, ROCKET_HEIGHT / 2);
        ctx.lineTo(-ROCKET_WIDTH / 2, ROCKET_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();
        
        // Rocket window
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(0, -ROCKET_HEIGHT / 6, ROCKET_WIDTH / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Rocket fins
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(ROCKET_WIDTH / 2, ROCKET_HEIGHT / 3);
        ctx.lineTo(ROCKET_WIDTH, ROCKET_HEIGHT / 2);
        ctx.lineTo(ROCKET_WIDTH / 2, ROCKET_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-ROCKET_WIDTH / 2, ROCKET_HEIGHT / 3);
        ctx.lineTo(-ROCKET_WIDTH, ROCKET_HEIGHT / 2);
        ctx.lineTo(-ROCKET_WIDTH / 2, ROCKET_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();
        
        // Rocket flame
        if (rocket.accelerating && rocket.fuel > 0) {
            const flameHeight = ROCKET_HEIGHT * (0.5 + Math.random() * 0.2);
            const gradient = ctx.createLinearGradient(0, ROCKET_HEIGHT / 2, 0, ROCKET_HEIGHT / 2 + flameHeight);
            gradient.addColorStop(0, '#f97316');
            gradient.addColorStop(0.6, '#f59e0b');
            gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(-ROCKET_WIDTH / 3, ROCKET_HEIGHT / 2);
            ctx.lineTo(0, ROCKET_HEIGHT / 2 + flameHeight);
            ctx.lineTo(ROCKET_WIDTH / 3, ROCKET_HEIGHT / 2);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    } else {
        // Draw explosion
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, ROCKET_HEIGHT, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, ROCKET_HEIGHT * 0.7, 0, Math.PI * 2);
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
