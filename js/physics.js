/**
 * Calculates gravity force between an object and a celestial body
 * @param {Object} objectPos - Position of the object {x, y}
 * @param {Object} body - The celestial body
 * @returns {Object} Gravity force components and distance
 */
function calculateGravityForce(objectPos, body) {
    const distanceSquared = calculateDistanceSquared(objectPos.x, objectPos.y, body.position.x, body.position.y);
    const distance = Math.sqrt(distanceSquared);
    const distanceToSurface = distance - body.radius;
    
    // Calculate gravity force using inverse law with decay factor
    const gravityForce = GRAVITY_FACTOR * body.gravity * (body.radius * body.radius) * Math.pow(distanceToSurface, GRAVITY_SURFACE_DECAY_FACTOR) * Math.pow(distance, GRAVITY_DECAY_FACTOR);
    const angle = Math.atan2(body.position.y - objectPos.y, body.position.x - objectPos.x);
    
    return {
        force: gravityForce,
        angle: angle,
        distance: distance,
        components: {
            x: Math.cos(angle) * gravityForce,
            y: Math.sin(angle) * gravityForce
        }
    };
}

/**
 * Applies gravity from a celestial body to the rocket
 * @param {Object} rocket - The rocket object
 * @param {Object} body - The celestial body object
 */
function applyGravity(rocket, body) {
    const gravity = calculateGravityForce(rocket, body);
    
    // Only apply gravity if it's above the minimum threshold and rocket is not landed
    if (gravity.force > MIN_GRAVITY_THRESHOLD && !rocket.landed) {
        rocket.velocity.x += gravity.components.x;
        rocket.velocity.y += gravity.components.y;
    }
    
    // Check if the rocket is landing on the body
    if (rocket.landed && rocket.onBody === body) {
        // Calculate the angle from the center of the body to the rocket
        const rocketAngle = Math.atan2(rocket.y - body.position.y, rocket.x - body.position.x);
        
        // For Earth's top (12 o'clock position), ensure rocket is exactly at the top
        if (rocket.onBody === CELESTIAL_BODIES.EARTH && 
            Math.abs(rocketAngle + Math.PI/2) < 0.1) { // If close to -PI/2 (top)
            // Place at exactly 12 o'clock
            rocket.x = body.position.x;
            rocket.y = body.position.y - body.radius - ROCKET_HEIGHT / 2 - 1; // Add 1 pixel margin
            rocket.angle = 0; // Point straight up (adjusted for drawing function)
        }
    }
    
    return gravity.distance;
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
    return calculateDistanceToBody(rocket.x, rocket.y, CELESTIAL_BODIES.EARTH);
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
            const gravity = calculateGravityForce(simRocket, body);
            
            // Check for collision with body
            if (gravity.distance < body.radius) {
                return trajectoryPoints;
            }
            
            if (gravity.force > MIN_GRAVITY_THRESHOLD) {
                simRocket.velocity.x += gravity.components.x * timeStep;
                simRocket.velocity.y += gravity.components.y * timeStep;
            }
        }
        
        // Update position
        simRocket.x += simRocket.velocity.x * timeStep;
        simRocket.y += simRocket.velocity.y * timeStep;
        
        // Check if we've gone too far from Earth
        const distanceFromEarth = calculateDistanceToBody(simRocket.x, simRocket.y, CELESTIAL_BODIES.EARTH);
        
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
    const distanceToBody = calculateDistanceToBody(rocket.x, rocket.y, body);
    
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

/**
 * Calculates the squared distance between two points
 * @param {number} x1 - X coordinate of the first point
 * @param {number} y1 - Y coordinate of the first point
 * @param {number} x2 - X coordinate of the second point
 * @param {number} y2 - Y coordinate of the second point
 * @returns {number} Squared distance between the two points
 */
function calculateDistanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Calculates the distance between a point and a celestial body
 * @param {number} x - X coordinate of the point
 * @param {number} y - Y coordinate of the point
 * @param {Object} body - The celestial body
 * @returns {number} Distance between the point and the celestial body
 */
function calculateDistanceToBody(x, y, body) {
    return Math.sqrt(calculateDistanceSquared(x, y, body.position.x, body.position.y));
}
