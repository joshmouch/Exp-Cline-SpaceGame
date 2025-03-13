/**
 * Applies gravity from a celestial body to the rocket
 * @param {Object} rocket - The rocket object
 * @param {Object} body - The celestial body object
 */
function applyGravity(rocket, body) {
    const dx = body.position.x - rocket.x;
    const dy = body.position.y - rocket.y;
    const distanceSquared = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSquared);
    
    // Calculate gravity force using inverse square law
    const gravityForce = GRAVITY_FACTOR * body.gravity * (body.radius * body.radius) / distanceSquared;
    
    // Only apply gravity if it's above the minimum threshold
    if (gravityForce > MIN_GRAVITY_THRESHOLD) {
        const gravityAngle = Math.atan2(dy, dx);
        
        // Apply force to rocket velocity
        rocket.velocity.x += Math.cos(gravityAngle) * gravityForce;
        rocket.velocity.y += Math.sin(gravityAngle) * gravityForce;
    }
    
    return distance;
}

/**
 * Applies gravity from all celestial bodies to the rocket
 * @param {Object} rocket - The rocket object
 */
function applyAllGravity(rocket) {
    // Apply gravity from all bodies, sorted by strongest gravity first
    for (const body of SORTED_CELESTIAL_BODIES) {
        applyGravity(rocket, body);
    }
    
    // Return distance from Earth for reference
    const dx = CELESTIAL_BODIES.EARTH.position.x - rocket.x;
    const dy = CELESTIAL_BODIES.EARTH.position.y - rocket.y;
    return Math.sqrt(dx * dx + dy * dy);
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
    
    // Make a deep copy of the rocket's current state for simulation
    let simRocket = {
        x: rocket.x,
        y: rocket.y,
        velocity: {
            x: rocket.velocity.x,
            y: rocket.velocity.y
        }
    };
    
    // Use fixed parameters for consistent trajectory prediction
    const timeStep = 1.0;
    const maxPoints = points;
    const maxDistance = CELESTIAL_BODIES.EARTH.radius * 20; // Reduced to keep trajectory more focused
    
    // Simulate steps
    for (let i = 0; i < maxPoints; i++) {
        // Store point with opacity information
        trajectoryPoints.push({ 
            x: simRocket.x, 
            y: simRocket.y,
            opacity: 1 - (i / maxPoints) // Opacity decreases with distance
        });
        
        // Apply gravity from all celestial bodies
        for (const body of SORTED_CELESTIAL_BODIES) {
            const dx = body.position.x - simRocket.x;
            const dy = body.position.y - simRocket.y;
            const distanceSquared = dx * dx + dy * dy;
            
            // Check for collision with body
            if (Math.sqrt(distanceSquared) < body.radius) {
                return trajectoryPoints;
            }
            
            // Calculate gravity force
            const effectiveDistanceSquared = Math.max(distanceSquared, body.radius * body.radius * 0.1);
            const gravityForce = GRAVITY_FACTOR * body.gravity * (body.radius * body.radius) / effectiveDistanceSquared;
            
            if (gravityForce > MIN_GRAVITY_THRESHOLD) {
                const gravityAngle = Math.atan2(dy, dx);
                simRocket.velocity.x += Math.cos(gravityAngle) * gravityForce * timeStep;
                simRocket.velocity.y += Math.sin(gravityAngle) * gravityForce * timeStep;
            }
        }
        
        // Update position
        simRocket.x += simRocket.velocity.x * timeStep;
        simRocket.y += simRocket.velocity.y * timeStep;
        
        // Check if we've gone too far from Earth
        const distanceFromEarth = Math.sqrt(
            Math.pow(simRocket.x - CELESTIAL_BODIES.EARTH.position.x, 2) +
            Math.pow(simRocket.y - CELESTIAL_BODIES.EARTH.position.y, 2)
        );
        
        if (distanceFromEarth > maxDistance) {
            break;
        }
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
 * @param {Object} body - The celestial body to orbit around (default: Earth)
 * @param {number} minDistanceFactor - Minimum distance factor from body to count as orbiting
 * @returns {Object} Object containing new lastQuadrant and whether orbit was completed
 */
function trackOrbit(rocket, lastQuadrant, body = CELESTIAL_BODIES.EARTH, minDistanceFactor = 1.5) {
    // Calculate distance to the body
    const dx = body.position.x - rocket.x;
    const dy = body.position.y - rocket.y;
    const distanceToBody = Math.sqrt(dx * dx + dy * dy);
    
    // Minimum distance to count as orbiting
    const minDistance = body.radius * minDistanceFactor;
    
    // Only track orbit if we're far enough from the body
    if (distanceToBody > minDistance) {
        // Calculate quadrant relative to the body
        const relativeX = rocket.x - body.position.x;
        const relativeY = rocket.y - body.position.y;
        const currentQuadrant = determineQuadrant(relativeX, relativeY);
        
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
