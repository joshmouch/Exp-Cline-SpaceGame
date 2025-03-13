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
    
    // Update zoom based on auto-zoom setting
    if (controls.autoZoom) {
        // If we have trajectory points, fit them in the view
        if (trajectoryPoints.length > 0) {
            // Find the bounding box of the trajectory
            let minX = rocket.x;
            let minY = rocket.y;
            let maxX = rocket.x;
            let maxY = rocket.y;
            
            // Include Earth in the bounding box
            minX = Math.min(minX, -EARTH_RADIUS);
            minY = Math.min(minY, -EARTH_RADIUS);
            maxX = Math.max(maxX, EARTH_RADIUS);
            maxY = Math.max(maxY, EARTH_RADIUS);
            
            // Include trajectory points in the bounding box
            for (let i = 0; i < trajectoryPoints.length; i++) {
                minX = Math.min(minX, trajectoryPoints[i].x);
                minY = Math.min(minY, trajectoryPoints[i].y);
                maxX = Math.max(maxX, trajectoryPoints[i].x);
                maxY = Math.max(maxY, trajectoryPoints[i].y);
            }
            
            // Calculate the width and height of the bounding box
            const width = maxX - minX;
            const height = maxY - minY;
            
            // Add a buffer (20% of the size)
            const buffer = 0.2;
            const bufferedWidth = width * (1 + buffer);
            const bufferedHeight = height * (1 + buffer);
            
            // Calculate the zoom level needed to fit the bounding box
            const zoomX = 900 / bufferedWidth; // 900 is the canvas width
            const zoomY = 600 / bufferedHeight; // 600 is the canvas height
            
            // Use the smaller zoom level to ensure everything fits
            let idealZoom = Math.min(zoomX, zoomY);
            
            // Ensure zoom is within bounds
            idealZoom = Math.max(minZoom, Math.min(idealZoom, maxZoom));
            
            // Set the target zoom
            camera.targetZoom = idealZoom;
        } else {
            // Fall back to distance-based zoom if no trajectory
            let distanceRatio = Math.min(distanceToEarthCenter / maxDistance, 1);
            let idealZoom = maxZoom - (maxZoom - minZoom) * distanceRatio;
            
            // Ensure we can always see Earth
            camera.targetZoom = Math.max(minZoom, Math.min(idealZoom, maxZoom));
        }
    }
    
    // Always update the actual zoom based on target zoom (whether auto-zoom is enabled or not)
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.05;
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
