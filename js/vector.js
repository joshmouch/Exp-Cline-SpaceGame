/**
 * Vector class for 2D vector operations
 */
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Create a copy of this vector
    clone() {
        return new Vector(this.x, this.y);
    }

    // Add another vector to this one
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    // Subtract another vector from this one
    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    // Multiply this vector by a scalar
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    // Divide this vector by a scalar
    divide(scalar) {
        if (scalar === 0) {
            console.error("Division by zero");
            return new Vector();
        }
        return new Vector(this.x / scalar, this.y / scalar);
    }

    // Calculate the magnitude (length) of this vector
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Calculate the squared magnitude (for performance when comparing distances)
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    // Normalize this vector (make it unit length)
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector();
        }
        return this.divide(mag);
    }

    // Calculate the dot product with another vector
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    // Calculate the cross product with another vector (in 2D this is a scalar)
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    // Calculate the distance to another vector
    distance(v) {
        return this.subtract(v).magnitude();
    }

    // Calculate the angle of this vector in radians
    angle() {
        return Math.atan2(this.y, this.x);
    }

    // Rotate this vector by an angle in radians
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    // Create a vector from an angle and magnitude
    static fromAngle(angle, magnitude = 1) {
        return new Vector(
            magnitude * Math.cos(angle),
            magnitude * Math.sin(angle)
        );
    }

    // Linear interpolation between two vectors
    static lerp(v1, v2, t) {
        return v1.add(v2.subtract(v1).multiply(t));
    }
}
