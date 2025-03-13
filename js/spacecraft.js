/**
 * Spacecraft class for player-controlled rocket
 */
class Spacecraft {
    constructor(options = {}) {
        // Position and movement
        this.position = options.position || new Vector();
        this.velocity = options.velocity || new Vector();
        this.angle = options.angle || -Math.PI / 2; // Point upward by default
        this.angularVelocity = 0;
        
        // Physical properties
        this.mass = options.mass || 1;
        this.size = options.size || 20; // Size of spacecraft for rendering
        this.thrustPower = options.thrustPower || 0.5;
        this.rotationSpeed = options.rotationSpeed || 0.05;
        
        // Fuel system
        this.maxFuel = options.maxFuel || 1000;
        this.fuel = options.fuel || this.maxFuel;
        this.fuelConsumptionRate = options.fuelConsumptionRate || 0.5;
        
        // State flags
        this.thrusting = false;
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.landed = false;
        this.landedOn = null;
        this.crashed = false;
        this.outOfFuel = false;
        this.collisionDetectionEnabled = false;
        
        // Landing gear
        this.landingGearDeployed = false;
        
        // Trail for rendering
        this.trail = [];
        this.maxTrailLength = 50;
        
        // Exhaust particles for thruster effect
        this.exhaustParticles = [];
        this.maxExhaustParticles = 50;
    }

    update(deltaTime, celestialBodies, physics) {
        // Skip update if crashed
        if (this.crashed) {
            return;
        }
        
        // Handle rotation
        if (this.rotatingLeft) {
            this.angle -= this.rotationSpeed * deltaTime;
        }
        if (this.rotatingRight) {
            this.angle += this.rotationSpeed * deltaTime;
        }
        
        // Apply thrust if thrusting and has fuel
        if (this.thrusting && this.fuel > 0) {
            // Calculate thrust vector based on spacecraft angle
            const thrustVector = Vector.fromAngle(this.angle, this.thrustPower * deltaTime);
            
            // Apply thrust to velocity
            this.velocity = this.velocity.add(thrustVector);
            
            // Consume fuel
            this.fuel -= this.fuelConsumptionRate * deltaTime;
            
            // Create exhaust particles
            this.createExhaustParticles();
            
            // If fuel runs out, set flag
            if (this.fuel <= 0) {
                this.fuel = 0;
                this.outOfFuel = true;
                this.thrusting = false;
            }
        }
        
        // Reset landed state if moving
        if (this.landed && this.velocity.magnitude() > 0.1) {
            this.landed = false;
            this.landedOn = null;
        }
        
        // Apply gravitational forces from all celestial bodies
        let netForce = new Vector();
        
        for (const body of celestialBodies) {
            if (body.hasGravity) {
                const force = physics.calculateGravitationalForce(
                    this.mass,
                    body.mass,
                    this.position,
                    body.position
                );
                netForce = netForce.add(force);
            }
        }
        
        // F = ma, so a = F/m
        const acceleration = netForce.divide(this.mass);
        
        // Update velocity: v = v + a*t
        this.velocity = this.velocity.add(acceleration.multiply(deltaTime));
        
        // Update position: p = p + v*t
        if (!this.landed) {
            this.position = this.position.add(this.velocity.multiply(deltaTime));
        }
        
        // Add current position to trail
        if (this.trail.length >= this.maxTrailLength) {
            this.trail.shift(); // Remove oldest point
        }
        
        // Only add to trail if moving fast enough
        if (this.velocity.magnitude() > 1) {
            this.trail.push(this.position.clone());
        }
        
        // Update exhaust particles
        this.updateExhaustParticles(deltaTime);
        
        // Check for collisions with celestial bodies
        this.checkCollisions(celestialBodies, physics);
    }

    createExhaustParticles() {
        // Don't create particles if at max
        if (this.exhaustParticles.length >= this.maxExhaustParticles) {
            return;
        }
        
        // Calculate exhaust position (back of spacecraft)
        const exhaustPos = this.position.add(
            Vector.fromAngle(this.angle + Math.PI, this.size * 0.7)
        );
        
        // Create 1-3 particles with random spread
        const particleCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < particleCount; i++) {
            // Random spread angle
            const spreadAngle = (Math.random() - 0.5) * 0.5;
            
            // Particle velocity opposite to thrust direction with spread
            const particleVelocity = Vector.fromAngle(
                this.angle + Math.PI + spreadAngle,
                (Math.random() * 2 + 3) // Random speed
            );
            
            // Add particle
            this.exhaustParticles.push({
                position: exhaustPos.clone(),
                velocity: particleVelocity,
                size: Math.random() * 3 + 2,
                life: 1.0, // Full life
                color: Math.random() > 0.7 ? '#ff9500' : '#ff5000' // Orange or red
            });
        }
    }

    updateExhaustParticles(deltaTime) {
        for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
            const particle = this.exhaustParticles[i];
            
            // Update position
            particle.position = particle.position.add(
                particle.velocity.multiply(deltaTime)
            );
            
            // Decrease size and life
            particle.size *= 0.95;
            particle.life -= deltaTime * 2;
            
            // Remove dead particles
            if (particle.life <= 0 || particle.size < 0.5) {
                this.exhaustParticles.splice(i, 1);
            }
        }
    }

    checkCollisions(celestialBodies, physics) {
        // Skip collision detection if not enabled
        if (!this.collisionDetectionEnabled) {
            return;
        }
        
        for (const body of celestialBodies) {
            const distance = this.position.distance(body.position);
            
            // Check if spacecraft is touching the surface
            if (distance <= body.radius + this.size * 0.5) {
                // Get surface normal at contact point
                const surfaceNormal = body.getSurfaceNormalAt(this.position);
                
                // Check if landing is successful
                const landingResult = physics.checkLanding(this.velocity, surfaceNormal);
                
                if (landingResult.success) {
                    // Successful landing
                    this.land(body);
                } else {
                    // Crash
                    this.crash(landingResult.reason);
                }
                
                break;
            }
        }
    }

    land(celestialBody) {
        this.landed = true;
        this.landedOn = celestialBody;
        this.velocity = new Vector(); // Stop movement
        this.angularVelocity = 0;
        
        // Align to surface normal
        const surfaceNormal = celestialBody.getSurfaceNormalAt(this.position);
        this.angle = surfaceNormal.angle() - Math.PI / 2;
        
        // Position exactly on surface
        const distanceToCenter = celestialBody.position.distance(this.position);
        const surfacePoint = celestialBody.position.add(
            surfaceNormal.multiply(celestialBody.radius)
        );
        this.position = surfacePoint;
    }

    crash(reason) {
        this.crashed = true;
        this.crashReason = reason || "Impact too severe";
        this.velocity = new Vector(0, 0);
        
        // Create explosion particles (would be implemented in renderer)
    }

    applyThrust(on) {
        this.thrusting = on && this.fuel > 0 && !this.crashed && !this.landed;
    }

    rotateLeft(on) {
        this.rotatingLeft = on && !this.crashed;
    }

    rotateRight(on) {
        this.rotatingRight = on && !this.crashed;
    }

    toggleLandingGear() {
        this.landingGearDeployed = !this.landingGearDeployed;
    }

    getFuelPercentage() {
        return (this.fuel / this.maxFuel) * 100;
    }

    getSpeed() {
        return this.velocity.magnitude();
    }

    refuel(amount) {
        this.fuel = Math.min(this.maxFuel, this.fuel + amount);
        this.outOfFuel = false;
    }

    reset(position, angle) {
        this.position = position || new Vector();
        this.velocity = new Vector();
        this.angle = angle || -Math.PI / 2;
        this.angularVelocity = 0;
        this.fuel = this.maxFuel;
        this.thrusting = false;
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.landed = false;
        this.landedOn = null;
        this.crashed = false;
        this.outOfFuel = false;
        this.landingGearDeployed = false;
        this.trail = [];
        this.exhaustParticles = [];
    }
}
