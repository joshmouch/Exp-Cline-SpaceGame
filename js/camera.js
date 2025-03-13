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
        // Find the bounding box based on destination
        let minX = rocket.x;
        let minY = rocket.y;
        let maxX = rocket.x;
        let maxY = rocket.y;
        
        // Always include Earth in the bounding box
        minX = Math.min(minX, -EARTH_RADIUS);
        minY = Math.min(minY, -EARTH_RADIUS);
        maxX = Math.max(maxX, EARTH_RADIUS);
        maxY = Math.max(maxY, EARTH_RADIUS);
        
        // Include trajectory points in the bounding box if no specific destination
        if (controls.destination === 'none' && trajectoryPoints.length > 0) {
            for (let i = 0; i < trajectoryPoints.length; i++) {
                minX = Math.min(minX, trajectoryPoints[i].x);
                minY = Math.min(minY, trajectoryPoints[i].y);
                maxX = Math.max(maxX, trajectoryPoints[i].x);
                maxY = Math.max(maxY, trajectoryPoints[i].y);
            }
        } 
        // Include specific destination in the bounding box
        else if (controls.destination !== 'none' && controls.destination !== 'earth') {
            if (controls.destination === 'moon') {
                minX = Math.min(minX, MOON_POSITION.x - MOON_RADIUS);
                minY = Math.min(minY, MOON_POSITION.y - MOON_RADIUS);
                maxX = Math.max(maxX, MOON_POSITION.x + MOON_RADIUS);
                maxY = Math.max(maxY, MOON_POSITION.y + MOON_RADIUS);
            } else if (controls.destination === 'sun') {
                minX = Math.min(minX, SUN_POSITION.x - SUN_RADIUS);
                minY = Math.min(minY, SUN_POSITION.y - SUN_RADIUS);
                maxX = Math.max(maxX, SUN_POSITION.x + SUN_RADIUS);
                maxY = Math.max(maxY, SUN_POSITION.y + SUN_RADIUS);
            } else {
                // Handle planets
                const planetPos = PLANET_POSITIONS[controls.destination];
                const planetRadius = PLANET_RADII[controls.destination];
                
                if (planetPos && planetRadius) {
                    minX = Math.min(minX, planetPos.x - planetRadius);
                    minY = Math.min(minY, planetPos.y - planetRadius);
                    maxX = Math.max(maxX, planetPos.x + planetRadius);
                    maxY = Math.max(maxY, planetPos.y + planetRadius);
                }
            }
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
    }
    
    // Always update the actual zoom based on target zoom (whether auto-zoom is enabled or not)
    // Use an adaptive adjustment rate for more responsive zooming
    // The larger the difference between current and target zoom, the faster the adjustment
    const zoomDifference = Math.abs(camera.targetZoom - camera.zoom);
    const adaptiveRate = Math.min(0.3, Math.max(0.1, zoomDifference * 0.5));
    camera.zoom += (camera.targetZoom - camera.zoom) * adaptiveRate;
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
