/**
 * Physics engine for space simulation
 */
class Physics {
    constructor() {
        // Gravitational constant (scaled for game)
        this.G = 6.67430e-2;
        
        // Time step for physics calculations (seconds)
        this.timeStep = 0.016; // ~60fps
    }

    // Calculate gravitational force between two objects
    calculateGravitationalForce(mass1, mass2, position1, position2) {
        const direction = position2.subtract(position1);
        const distance = direction.magnitude();
        
        // Avoid division by zero or very small values
        if (distance < 1) {
            return new Vector();
        }
        
        // F = G * (m1 * m2) / r^2
        const forceMagnitude = this.G * mass1 * mass2 / (distance * distance);
        
        // Force direction is along the vector connecting the two objects
        return direction.normalize().multiply(forceMagnitude);
    }

    // Calculate orbital velocity for circular orbit at a given distance
    calculateOrbitalVelocity(centralMass, distance) {
        return Math.sqrt(this.G * centralMass / distance);
    }

    // Calculate escape velocity at a given distance from a mass
    calculateEscapeVelocity(centralMass, distance) {
        return Math.sqrt(2 * this.G * centralMass / distance);
    }

    // Predict trajectory points based on current position, velocity, and celestial bodies
    predictTrajectory(position, velocity, celestialBodies, steps = 200, stepMultiplier = 5) {
        const trajectory = [];
        let pos = position.clone();
        let vel = velocity.clone();
        
        // Use larger time steps for prediction to look further ahead
        const predictionTimeStep = this.timeStep * stepMultiplier;
        
        for (let i = 0; i < steps; i++) {
            trajectory.push(pos.clone());
            
            // Calculate net force from all celestial bodies
            let netForce = new Vector();
            
            for (const body of celestialBodies) {
                if (body.hasGravity) {
                    const force = this.calculateGravitationalForce(
                        1, // Unit mass for the spacecraft
                        body.mass,
                        pos,
                        body.position
                    );
                    netForce = netForce.add(force);
                }
            }
            
            // F = ma, so a = F/m (assuming spacecraft mass = 1)
            const acceleration = netForce;
            
            // Update velocity: v = v + a*t
            vel = vel.add(acceleration.multiply(predictionTimeStep));
            
            // Update position: p = p + v*t
            pos = pos.add(vel.multiply(predictionTimeStep));
            
            // Check for collisions with any celestial body
            let collision = false;
            for (const body of celestialBodies) {
                const distance = pos.distance(body.position);
                if (distance < body.radius) {
                    collision = true;
                    break;
                }
            }
            
            if (collision) {
                break;
            }
        }
        
        return trajectory;
    }

    // Calculate orbital parameters (semi-major axis, eccentricity)
    calculateOrbitalParameters(position, velocity, centralBody) {
        const r = position.subtract(centralBody.position);
        const v = velocity;
        const mu = this.G * centralBody.mass;
        
        // Specific angular momentum
        const h = r.cross(v);
        
        // Eccentricity vector
        const evec = r.multiply(v.magnitudeSquared() / mu - 1 / r.magnitude())
                      .subtract(v.multiply(r.dot(v) / mu));
        
        // Eccentricity
        const e = evec.magnitude();
        
        // Semi-major axis
        const a = h * h / (mu * (1 - e * e));
        
        return {
            semiMajorAxis: isFinite(a) ? Math.abs(a) : Infinity,
            eccentricity: e
        };
    }

    // Check if a landing is successful based on velocity and angle
    checkLanding(velocity, surfaceNormal, maxLandingSpeed = 20) {
        const speed = velocity.magnitude();
        
        // Check if speed is below the maximum landing speed
        if (speed > maxLandingSpeed) {
            return {
                success: false,
                reason: "Landing speed too high"
            };
        }
        
        // If velocity is very low, landing is always successful
        if (speed < 2) {
            return {
                success: true,
                reason: "Successful landing"
            };
        }
        
        // Check if the landing angle is appropriate
        // The dot product of velocity and surface normal should be negative (approaching)
        // and the angle should be close to perpendicular
        const normalizedVelocity = velocity.normalize();
        const dotProduct = normalizedVelocity.dot(surfaceNormal);
        
        // Allow for more deviation from perfect perpendicular landing
        if (dotProduct > -0.5) {
            return {
                success: false,
                reason: "Landing angle too steep"
            };
        }
        
        return {
            success: true,
            reason: "Successful landing"
        };
    }
}
