/**
 * Creates a camera object
 * @returns {Object} A new camera object
 */
function createCamera() {
    return {
        x: 0,
        y: 0,
        zoom: MAX_ZOOM,
        targetZoom: MAX_ZOOM
    };
}

/**
 * Updates the camera position based on the focus selection
 * @param {Object} camera - The camera object
 * @param {Object} rocket - The rocket object
 * @param {Array} trajectoryPoints - Array of trajectory points
 * @param {Object} controls - The controls object
 */
function updateCamera(camera, rocket, trajectoryPoints, controls) {
    // Only update camera position if focus is not manual
    if (controls.focus !== 'manual') {
        let targetX = 0;
        let targetY = 0;
        
        if (controls.focus === 'ship') {
            // Focus on the rocket
            targetX = rocket.x;
            targetY = rocket.y;
        } else {
            // Focus on celestial body
            const body = CELESTIAL_BODIES[controls.focus.toUpperCase()];
            if (body) {
                targetX = body.position.x;
                targetY = body.position.y;
            } else {
                console.warn('Unknown focus target:', controls.focus);
                return; // Don't update camera if target is unknown
            }
        }
        
        // Smooth camera movement
        camera.x += (targetX - camera.x) * 0.05;
        camera.y += (targetY - camera.y) * 0.05;
    }
    
    // Always update the actual zoom based on target zoom
    // Use an adaptive adjustment rate for more responsive zooming
    const zoomDifference = Math.abs(camera.targetZoom - camera.zoom);
    const adaptiveRate = Math.min(0.3, Math.max(0.1, zoomDifference * 0.5));
    camera.zoom += (camera.targetZoom - camera.zoom) * adaptiveRate;
}

/**
 * Zooms the camera in
 * @param {Object} camera - The camera object
 * @param {number} factor - Zoom factor
 */
function zoomIn(camera, factor = 1.5) {
    camera.targetZoom = Math.min(camera.targetZoom * factor, MAX_ZOOM);
}

/**
 * Zooms the camera out
 * @param {Object} camera - The camera object
 * @param {number} factor - Zoom factor
 */
function zoomOut(camera, factor = 1.5) {
    camera.targetZoom = Math.max(camera.targetZoom / factor, MIN_ZOOM);
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
