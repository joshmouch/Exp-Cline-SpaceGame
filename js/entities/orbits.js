/**
 * Updates the positions of all celestial bodies based on their orbital parameters
 * @param {number} gameTime - Current game time for animations
 * @param {Object} rocket - Optional rocket object to update if landed
 */
function updateOrbits(gameTime, rocket = null) {
    // First update positions of bodies that don't orbit anything (like the Sun)
    // Then update positions of bodies that orbit those bodies, and so on
    
    // Create a map of bodies by their name for easy lookup
    const bodiesByName = {};
    Object.keys(CELESTIAL_BODIES).forEach(key => {
        const body = CELESTIAL_BODIES[key];
        bodiesByName[body.name.toLowerCase()] = body;
    });
    
    // Update positions of all bodies
    Object.values(CELESTIAL_BODIES).forEach(body => {
        if (!body.orbits) {
            // This body doesn't orbit anything (e.g., the Sun)
            return;
        }
        
        // Find the parent body
        const parentName = body.orbits.toLowerCase();
        const parent = bodiesByName[parentName];
        
        if (!parent) {
            console.error(`Parent body ${body.orbits} not found for ${body.name}`);
            return;
        }
        
        // Calculate the new position based on orbital parameters
        const angle = gameTime * body.orbitSpeed + body.orbitPhase;
        body.position.x = parent.position.x + Math.cos(angle) * body.orbitRadius;
        body.position.y = parent.position.y + Math.sin(angle) * body.orbitRadius;
        
        // If rocket is landed on this body, update its position too
        if (rocket && rocket.landed && rocket.onBody === body) {
            const rocketAngle = Math.atan2(rocket.y - body.position.y, rocket.x - body.position.x);
            rocket.x = body.position.x + Math.cos(rocketAngle) * (body.radius + ROCKET_HEIGHT / 2);
            rocket.y = body.position.y + Math.sin(rocketAngle) * (body.radius + ROCKET_HEIGHT / 2);
            rocket.angle = rocketAngle - Math.PI / 2; // Point perpendicular to surface
        }
    });
}

/**
 * Creates a map of celestial bodies by their name
 * @returns {Object} Map of bodies by lowercase name
 */
function createBodiesMap() {
    const bodiesByName = {};
    Object.keys(CELESTIAL_BODIES).forEach(key => {
        const body = CELESTIAL_BODIES[key];
        bodiesByName[body.name.toLowerCase()] = body;
    });
    return bodiesByName;
}

/**
 * Draws an orbital path
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} center - Center point {x, y}
 * @param {number} radius - Orbit radius
 * @param {string} color - Stroke color
 * @param {number} width - Line width
 */
function drawOrbit(ctx, center, radius, color = 'rgba(255, 255, 255, 0.1)', width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
}

/**
 * Draws the orbital paths of all celestial bodies
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function drawOrbitalPaths(ctx) {
    const bodiesByName = createBodiesMap();
    
    // Draw orbital paths for all bodies
    Object.values(CELESTIAL_BODIES).forEach(body => {
        if (!body.orbits) {
            return; // This body doesn't orbit anything (e.g., the Sun)
        }
        
        // Find the parent body
        const parentName = body.orbits.toLowerCase();
        const parent = bodiesByName[parentName];
        
        if (!parent) {
            return;
        }
        
        // Draw the orbital path
        drawOrbit(ctx, parent.position, body.orbitRadius);
    });
}

/**
 * Draws the rocket's orbit path
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array} orbitPath - Array of orbit path points
 */
function drawOrbitPath(ctx, orbitPath) {
    if (orbitPath.length > 1) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(orbitPath[0].x, orbitPath[0].y);
        for (let i = 1; i < orbitPath.length; i++) {
            ctx.lineTo(orbitPath[i].x, orbitPath[i].y);
        }
        ctx.stroke();
    }
}

/**
 * Draws an orbit guide showing ideal orbital distance
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} rocket - The rocket object
 */
function drawOrbitGuide(ctx, rocket) {
    if (!rocket.landed && !rocket.exploded) {
        const idealOrbitRadius = CELESTIAL_BODIES.EARTH.radius * 3;
        ctx.setLineDash([5, 5]);
        drawOrbit(ctx, CELESTIAL_BODIES.EARTH.position, idealOrbitRadius, 'rgba(100, 200, 255, 0.2)', 2);
        ctx.setLineDash([]);
    }
}

// Export functions to window
window.updateOrbits = updateOrbits;
window.drawOrbitalPaths = drawOrbitalPaths;
window.drawOrbitPath = drawOrbitPath;
window.drawOrbitGuide = drawOrbitGuide;
