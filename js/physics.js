/**
 * Applies gravity from a celestial body to the rocket
 * @param {Object} rocket - The rocket object
 * @param {number} bodyX - X coordinate of the celestial body
 * @param {number} bodyY - Y coordinate of the celestial body
 * @param {number} bodyRadius - Radius of the celestial body
 * @param {number} gravityMultiplier - Multiplier for gravity strength (1 for Earth)
 */
function applyGravity(rocket, bodyX, bodyY, bodyRadius, gravityMultiplier = 1) {
    const dx = bodyX - rocket.x;
    const dy = bodyY - rocket.y;
    const distanceSquared = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSquared);
    
    // Calculate gravity force using inverse square law
    const gravityForce = GRAVITY_FACTOR * gravityMultiplier * (bodyRadius * bodyRadius) / distanceSquared;
    const gravityAngle = Math.atan2(dy, dx);
    
    // Apply force to rocket velocity
    rocket.velocity.x += Math.cos(gravityAngle) * gravityForce;
    rocket.velocity.y += Math.sin(gravityAngle) * gravityForce;
}

/**
 * Applies Earth's gravity to the rocket
 * @param {Object} rocket - The rocket object
 */
function applyEarthGravity(rocket) {
    applyGravity(rocket, 0, 0, EARTH_RADIUS, 1);
}

/**
 * Applies Moon's gravity to the rocket
 * @param {Object} rocket - The rocket object
 */
function applyMoonGravity(rocket) {
    applyGravity(rocket, MOON_POSITION.x, MOON_POSITION.y, MOON_RADIUS, 0.5);
}

/**
 * Applies Sun's gravity to the rocket
 * @param {Object} rocket - The rocket object
 */
function applySunGravity(rocket) {
    applyGravity(rocket, SUN_POSITION.x, SUN_POSITION.y, SUN_RADIUS, 5);
}

/**
 * Calculates the trajectory points for the rocket
 * @param {Object} rocket - The rocket object
 * @param {number} points - Number of points to calculate
 * @returns {Array} Array of trajectory points
 */
function calculateTrajectory(rocket, points) {
    if (rocket.landed || rocket.exploded) {
        return [];
    }
    
    const trajectoryPoints = [];
    let simX = rocket.x;
    let simY = rocket.y;
    let simVelX = rocket.velocity.x;
    let simVelY = rocket.velocity.y;
    
    for (let i = 0; i < points; i++) {
        // Simulate Earth gravity
        const distanceToEarth = calculateDistance(simX, simY);
        const gravityForce = GRAVITY_FACTOR * (EARTH_RADIUS * EARTH_RADIUS) / (distanceToEarth * distanceToEarth);
        const gravityAngle = Math.atan2(simY, simX);
        
        simVelX += Math.cos(gravityAngle) * gravityForce;
        simVelY += Math.sin(gravityAngle) * gravityForce;
        
        // Update position
        simX += simVelX;
        simY += simVelY;
        
        // Check for collision with Earth
        if (calculateDistance(simX, simY) < EARTH_RADIUS) {
            break;
        }
        
        trajectoryPoints.push({ x: simX, y: simY });
    }
    
    return trajectoryPoints;
}

/**
 * Updates the rocket's position based on its velocity
 * @param {Object} rocket - The rocket object
 */
function updateRocketPosition(rocket) {
    rocket.x += rocket.velocity.x;
    rocket.y += rocket.velocity.y;
}

/**
 * Determines the quadrant (1-4) of a point relative to the origin
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Quadrant number (1-4)
 */
function determineQuadrant(x, y) {
    if (x >= 0 && y < 0) return 1;
    if (x < 0 && y < 0) return 2;
    if (x < 0 && y >= 0) return 3;
    if (x >= 0 && y >= 0) return 4;
    return 0; // Should never happen
}

/**
 * Tracks orbit completion by checking quadrant transitions
 * @param {Object} rocket - The rocket object
 * @param {number} lastQuadrant - The last recorded quadrant
 * @param {number} minDistance - Minimum distance from Earth to count as orbiting
 * @returns {Object} Object containing new lastQuadrant and whether orbit was completed
 */
function trackOrbit(rocket, lastQuadrant, minDistance = EARTH_RADIUS * 1.5) {
    const distanceToEarth = calculateDistance(rocket.x, rocket.y);
    
    // Only track orbit if we're far enough from Earth
    if (distanceToEarth > minDistance) {
        const currentQuadrant = determineQuadrant(rocket.x, rocket.y);
        
        // If we moved from quadrant 4 to quadrant 1, we completed an orbit
        const orbitCompleted = (lastQuadrant === 4 && currentQuadrant === 1);
        
        return {
            lastQuadrant: currentQuadrant,
            orbitCompleted
        };
    }
    
    return {
        lastQuadrant,
        orbitCompleted: false
    };
}
