/**
 * Creates a camera object
 * @returns {Object} A new camera object
 */
function createCamera() {
    return {
        x: 0,
        y: 0,
        zoom: 1,
        targetZoom: 1
    };
}

/**
 * Updates the camera position to follow the rocket and keep Earth in view
 * @param {Object} camera - The camera object
 * @param {Object} rocket - The rocket object
 * @param {Array} trajectoryPoints - Array of trajectory points
 * @param {Object} controls - The controls object
 * @param {number} maxDistance - Maximum distance to consider for zoom
 * @param {number} minZoom - Minimum zoom level
 * @param {number} maxZoom - Maximum zoom level
 */
function updateCamera(camera, rocket, trajectoryPoints, controls, maxDistance = 5000, minZoom = 0.02, maxZoom = 1.0) {
    // Calculate distance from Earth to rocket
    const distanceToEarthCenter = Math.sqrt(rocket.x * rocket.x + rocket.y * rocket.y);
    
    if (controls.centerShip) {
        // Center on the rocket
        const earthToRocketVector = {
            x: rocket.x,
            y: rocket.y
        };
        
        // Position camera between Earth and rocket, but closer to rocket
        const cameraTargetX = earthToRocketVector.x * 0.7;
        const cameraTargetY = earthToRocketVector.y * 0.7;
        
        // Smooth camera movement
        camera.x += (cameraTargetX - camera.x) * 0.05;
        camera.y += (cameraTargetY - camera.y) * 0.05;
    } else if (trajectoryPoints.length > 0) {
        // Center on the trajectory
        let centerX = 0;
        let centerY = 0;
        
        // Calculate the center of the trajectory
        for (let i = 0; i < trajectoryPoints.length; i++) {
            centerX += trajectoryPoints[i].x;
            centerY += trajectoryPoints[i].y;
        }
        
        centerX /= trajectoryPoints.length;
        centerY /= trajectoryPoints.length;
        
        // Smooth camera movement
        camera.x += (centerX - camera.x) * 0.05;
        camera.y += (centerY - camera.y) * 0.05;
    }
    
    // Update zoom only if auto-zoom is enabled
    if (controls.autoZoom) {
        // Calculate ideal zoom based on distance
        let distanceRatio = Math.min(distanceToEarthCenter / maxDistance, 1);
        let idealZoom = maxZoom - (maxZoom - minZoom) * distanceRatio;
        
        // Ensure we can always see Earth
        camera.targetZoom = Math.max(minZoom, Math.min(idealZoom, maxZoom));
        camera.zoom += (camera.targetZoom - camera.zoom) * 0.05;
    }
}

/**
 * Zooms the camera in
 * @param {Object} camera - The camera object
 * @param {number} factor - Zoom factor
 * @param {number} maxZoom - Maximum zoom level
 */
function zoomIn(camera, factor = 1.5, maxZoom = 2) {
    camera.targetZoom = Math.min(camera.targetZoom * factor, maxZoom);
}

/**
 * Zooms the camera out
 * @param {Object} camera - The camera object
 * @param {number} factor - Zoom factor
 * @param {number} minZoom - Minimum zoom level
 */
function zoomOut(camera, factor = 1.5, minZoom = 0.1) {
    camera.targetZoom = Math.max(camera.targetZoom / factor, minZoom);
}

/**
 * Sets up the camera transform on the canvas context
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} camera - The camera object
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} canvasHeight - Height of the canvas
 */
function setupCameraTransform(ctx, camera, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
}

/**
 * Resets the camera transform on the canvas context
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function resetCameraTransform(ctx) {
    ctx.restore();
}
