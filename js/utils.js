/**
 * Normalizes an angle to be between -PI and PI
 * @param {number} angle - The angle to normalize
 * @returns {number} The normalized angle
 */
function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

/**
 * Calculates the distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} The distance between the points
 */
function calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the squared distance between two points (faster than calculateDistance)
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} The squared distance between the points
 */
function calculateDistanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

/**
 * Calculates the distance between a point and a celestial body
 * @param {number} x - X coordinate of point
 * @param {number} y - Y coordinate of point
 * @param {Object} body - The celestial body
 * @returns {number} The distance between the point and body center
 */
function calculateDistanceToBody(x, y, body) {
    return calculateDistance(x, y, body.position.x, body.position.y);
}

/**
 * Calculates the squared distance between a point and a celestial body (faster)
 * @param {number} x - X coordinate of point
 * @param {number} y - Y coordinate of point
 * @param {Object} body - The celestial body
 * @returns {number} The squared distance between the point and body center
 */
function calculateDistanceToBodySquared(x, y, body) {
    return calculateDistanceSquared(x, y, body.position.x, body.position.y);
}

/**
 * Checks if a point is within a certain distance of a celestial body
 * @param {number} x - X coordinate of point
 * @param {number} y - Y coordinate of point
 * @param {Object} body - The celestial body
 * @param {number} distance - The distance to check against
 * @returns {boolean} True if point is within distance of body
 */
function isWithinDistanceOfBody(x, y, body, distance) {
    return calculateDistanceToBodySquared(x, y, body) <= distance * distance;
}

/**
 * Gets the altitude of a point above a celestial body's surface
 * @param {number} x - X coordinate of point
 * @param {number} y - Y coordinate of point
 * @param {Object} body - The celestial body
 * @returns {number} The altitude above the body's surface (0 if below surface)
 */
function calculateAltitude(x, y, body) {
    return Math.max(0, calculateDistanceToBody(x, y, body) - body.radius);
}

// Export utility functions
window.normalizeAngle = normalizeAngle;
window.calculateDistance = calculateDistance;
window.calculateDistanceSquared = calculateDistanceSquared;
window.calculateDistanceToBody = calculateDistanceToBody;
window.calculateDistanceToBodySquared = calculateDistanceToBodySquared;
window.isWithinDistanceOfBody = isWithinDistanceOfBody;
window.calculateAltitude = calculateAltitude;
