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
    applyGravity(rocket, 0, 0, EARTH_RADIUS, EARTH_GRAVITY);
}

/**
 * Applies Moon's gravity to the rocket
 * @param {Object} rocket - The rocket object
 */
function applyMoonGravity(rocket) {
    applyGravity(rocket, MOON_POSITION.x, MOON_POSITION.y, MOON_RADIUS, MOON_GRAVITY);
}

/**
 * Applies Sun's gravity to the rocket
 * @param {Object} rocket - The rocket object
 */
function applySunGravity(rocket) {
    applyGravity(rocket, SUN_POSITION.x, SUN_POSITION.y, SUN_RADIUS, SUN_GRAVITY);
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
    
    // Use 3x more points as requested
    const extendedPoints = points * 3;
    
    // Larger time step to stretch out the trajectory
    const baseTimeStep = 2.0; // Increased from 0.5 to 2.0
    
    // Adaptive time step based on velocity
    const speed = Math.sqrt(simRocket.velocity.x * simRocket.velocity.x + 
                           simRocket.velocity.y * simRocket.velocity.y);
    
    // Adjust time step based on speed - faster rockets need larger steps to stretch trajectory
    const adaptiveTimeStep = Math.min(5.0, Math.max(1.0, baseTimeStep * (1 + speed / 20)));
    
    // Minimum number of points to calculate
    const minPoints = Math.min(30, extendedPoints);
    
    // Maximum distance to simulate (increased to stretch trajectory)
    const maxDistance = EARTH_RADIUS * 50; // Increased from 20x to 50x Earth radius
    
    // Skip factor to spread out points (only store every nth point)
    const skipFactor = 2;
    let skipCounter = 0;
    
    // Simulate multiple steps
    for (let i = 0; i < extendedPoints * skipFactor; i++) {
        // Apply Earth gravity to the simulated rocket
        const dx = 0 - simRocket.x; // Earth is at (0,0)
        const dy = 0 - simRocket.y;
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared);
        
        // Check for collision with Earth
        if (distance < EARTH_RADIUS) {
            break;
        }
        
        // Calculate gravity force using inverse square law
        // Use a minimum distance to prevent extreme forces when very close
        const effectiveDistanceSquared = Math.max(distanceSquared, EARTH_RADIUS * EARTH_RADIUS * 0.1);
        const gravityForce = GRAVITY_FACTOR * 0.5 * (EARTH_RADIUS * EARTH_RADIUS) / effectiveDistanceSquared;
        const gravityAngle = Math.atan2(dy, dx);
        
        // Apply Earth gravity force to velocity
        simRocket.velocity.x += Math.cos(gravityAngle) * gravityForce * adaptiveTimeStep;
        simRocket.velocity.y += Math.sin(gravityAngle) * gravityForce * adaptiveTimeStep;
        
        // Apply Moon gravity to the simulated rocket
        const moonDx = MOON_POSITION.x - simRocket.x;
        const moonDy = MOON_POSITION.y - simRocket.y;
        const moonDistanceSquared = moonDx * moonDx + moonDy * moonDy;
        const moonGravityForce = GRAVITY_FACTOR * 0.5 * (MOON_RADIUS * MOON_RADIUS) / moonDistanceSquared;
        const moonGravityAngle = Math.atan2(moonDy, moonDx);
        
        // Apply Moon gravity force to velocity
        simRocket.velocity.x += Math.cos(moonGravityAngle) * moonGravityForce * adaptiveTimeStep;
        simRocket.velocity.y += Math.sin(moonGravityAngle) * moonGravityForce * adaptiveTimeStep;
        
        // Apply Sun gravity to the simulated rocket only when far from Earth
        const distanceFromEarthSquared = simRocket.x * simRocket.x + simRocket.y * simRocket.y;
        const earthOrbitThreshold = (EARTH_RADIUS * 10) * (EARTH_RADIUS * 10);
        
        // Only apply sun gravity when far from Earth
        if (distanceFromEarthSquared > earthOrbitThreshold) {
            const sunDx = SUN_POSITION.x - simRocket.x;
            const sunDy = SUN_POSITION.y - simRocket.y;
            const sunDistanceSquared = sunDx * sunDx + sunDy * sunDy;
            const sunGravityForce = GRAVITY_FACTOR * SUN_GRAVITY * (SUN_RADIUS * SUN_RADIUS) / sunDistanceSquared;
            const sunGravityAngle = Math.atan2(sunDy, sunDx);
            
            // Apply Sun gravity force to velocity
            simRocket.velocity.x += Math.cos(sunGravityAngle) * sunGravityForce * adaptiveTimeStep;
            simRocket.velocity.y += Math.sin(sunGravityAngle) * sunGravityForce * adaptiveTimeStep;
        }
        
        // Update position based on velocity
        simRocket.x += simRocket.velocity.x * adaptiveTimeStep;
        simRocket.y += simRocket.velocity.y * adaptiveTimeStep;
        
        // Only store every nth point to spread them out
        skipCounter++;
        if (skipCounter >= skipFactor) {
            skipCounter = 0;
            
            // Store point with opacity information (for dimming effect)
            trajectoryPoints.push({ 
                x: simRocket.x, 
                y: simRocket.y,
                opacity: 1 - (trajectoryPoints.length / extendedPoints) // Opacity decreases with distance
            });
        }
        
        // Only break if we've calculated at least the minimum number of points
        // and we've gone too far from Earth
        if (trajectoryPoints.length >= minPoints && distance > maxDistance) {
            break;
        }
    }
    
    // Debug log
    console.log(`Calculated ${trajectoryPoints.length} trajectory points`);
    if (trajectoryPoints.length > 0) {
        console.log(`First point: (${trajectoryPoints[0].x.toFixed(2)}, ${trajectoryPoints[0].y.toFixed(2)})`);
        console.log(`Last point: (${trajectoryPoints[trajectoryPoints.length-1].x.toFixed(2)}, ${trajectoryPoints[trajectoryPoints.length-1].y.toFixed(2)})`);
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
