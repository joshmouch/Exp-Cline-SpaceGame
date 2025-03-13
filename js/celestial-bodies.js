/**
 * Celestial bodies for the solar system simulation
 */
class CelestialBody {
    constructor(options) {
        this.name = options.name || 'Unknown';
        this.mass = options.mass || 1;
        this.radius = options.radius || 10;
        this.position = options.position || new Vector();
        this.velocity = options.velocity || new Vector();
        this.color = options.color || '#ffffff';
        this.hasGravity = options.hasGravity !== undefined ? options.hasGravity : true;
        this.hasAtmosphere = options.hasAtmosphere || false;
        this.atmosphereColor = options.atmosphereColor || 'rgba(255, 255, 255, 0.2)';
        this.atmosphereHeight = options.atmosphereHeight || 10;
        this.rotationSpeed = options.rotationSpeed || 0;
        this.rotationAngle = 0;
        this.texture = options.texture || null;
        this.cloudTexture = options.cloudTexture || null;
        this.cloudSpeed = options.cloudSpeed || 0;
        this.cloudOffset = 0;
        this.surfaceFeatures = options.surfaceFeatures || [];
        this.orbitAround = options.orbitAround || null;
        this.orbitSpeed = options.orbitSpeed || 0;
        this.orbitAngle = options.orbitAngle || 0;
        this.orbitDistance = options.orbitDistance || 0;
        this.orbitTilt = options.orbitTilt || 0;
        this.rings = options.rings || null;
    }

    update(deltaTime) {
        // Update rotation
        this.rotationAngle += this.rotationSpeed * deltaTime;
        
        // Update cloud movement
        this.cloudOffset += this.cloudSpeed * deltaTime;
        
        // Update orbital position if orbiting another body
        if (this.orbitAround) {
            this.orbitAngle += this.orbitSpeed * deltaTime;
            
            // Calculate new position based on orbit
            const x = Math.cos(this.orbitAngle) * this.orbitDistance;
            const y = Math.sin(this.orbitAngle) * this.orbitDistance * Math.cos(this.orbitTilt);
            
            this.position = this.orbitAround.position.add(new Vector(x, y));
            
            // Calculate orbital velocity (perpendicular to position vector)
            const speed = this.orbitDistance * this.orbitSpeed;
            this.velocity = new Vector(
                -Math.sin(this.orbitAngle) * speed,
                Math.cos(this.orbitAngle) * speed * Math.cos(this.orbitTilt)
            );
        }
    }

    // Check if a point is inside this celestial body
    containsPoint(point) {
        return this.position.distance(point) <= this.radius;
    }

    // Get surface normal at a point (for landing calculations)
    getSurfaceNormalAt(point) {
        return point.subtract(this.position).normalize();
    }
}

class SolarSystem {
    constructor() {
        this.bodies = [];
        this.physics = new Physics();
        this.createCelestialBodies();
    }

    createCelestialBodies() {
        // Create Sun
        const sun = new CelestialBody({
            name: 'Sun',
            mass: 1.989e6, // Scaled mass
            radius: 100,
            position: new Vector(2000, 0),
            color: '#ffdd00',
            hasAtmosphere: true,
            atmosphereColor: 'rgba(255, 200, 100, 0.2)',
            atmosphereHeight: 30,
            rotationSpeed: 0.01,
            surfaceFeatures: [
                { type: 'sunspot', size: 10, position: new Vector(0.2, 0.3) },
                { type: 'sunspot', size: 15, position: new Vector(-0.3, -0.2) },
                { type: 'prominence', size: 20, position: new Vector(0, 0.8) }
            ]
        });
        this.bodies.push(sun);

        // Create Earth - positioned at origin for easier gameplay
        const earth = new CelestialBody({
            name: 'Earth',
            mass: 5.972e3, // Scaled mass
            radius: 50,
            position: new Vector(0, 0),
            color: '#1e88e5',
            hasAtmosphere: true,
            atmosphereColor: 'rgba(120, 180, 255, 0.3)',
            atmosphereHeight: 10,
            rotationSpeed: 0.05,
            cloudSpeed: 0.02,
            // Disable orbit around sun for gameplay simplicity
            orbitAround: null,
            orbitDistance: 0,
            orbitSpeed: 0,
            orbitTilt: 0
        });
        this.bodies.push(earth);

        // Create Moon
        const moon = new CelestialBody({
            name: 'Moon',
            mass: 7.342e1, // Scaled mass
            radius: 13,
            color: '#aaaaaa',
            rotationSpeed: 0.01,
            orbitAround: earth,
            orbitDistance: 150,
            orbitSpeed: 0.02,
            orbitTilt: Math.PI * 0.05, // ~2.9 degrees
            surfaceFeatures: [
                { type: 'crater', size: 2, position: new Vector(0.1, 0.2) },
                { type: 'crater', size: 3, position: new Vector(-0.3, 0.1) },
                { type: 'crater', size: 1.5, position: new Vector(0.2, -0.3) }
            ]
        });
        this.bodies.push(moon);

        // Create Mercury
        const mercury = new CelestialBody({
            name: 'Mercury',
            mass: 3.285e2, // Scaled mass
            radius: 19,
            color: '#a57046',
            rotationSpeed: 0.01,
            orbitAround: sun,
            orbitDistance: 800,
            orbitSpeed: 0.01,
            orbitTilt: Math.PI * 0.01
        });
        this.bodies.push(mercury);

        // Create Venus
        const venus = new CelestialBody({
            name: 'Venus',
            mass: 4.867e3, // Scaled mass
            radius: 48,
            color: '#e6c073',
            hasAtmosphere: true,
            atmosphereColor: 'rgba(230, 180, 30, 0.3)',
            atmosphereHeight: 15,
            rotationSpeed: 0.003,
            orbitAround: sun,
            orbitDistance: 1500,
            orbitSpeed: 0.007,
            orbitTilt: Math.PI * 0.02
        });
        this.bodies.push(venus);

        // Create Mars
        const mars = new CelestialBody({
            name: 'Mars',
            mass: 6.39e2, // Scaled mass
            radius: 27,
            color: '#c1440e',
            hasAtmosphere: true,
            atmosphereColor: 'rgba(200, 100, 50, 0.2)',
            atmosphereHeight: 5,
            rotationSpeed: 0.048,
            orbitAround: sun,
            orbitDistance: 3000,
            orbitSpeed: 0.004,
            orbitTilt: Math.PI * 0.04
        });
        this.bodies.push(mars);

        // Create Jupiter
        const jupiter = new CelestialBody({
            name: 'Jupiter',
            mass: 1.898e5, // Scaled mass
            radius: 80,
            color: '#e0ae6f',
            hasAtmosphere: true,
            atmosphereColor: 'rgba(230, 180, 120, 0.3)',
            atmosphereHeight: 20,
            rotationSpeed: 0.12,
            orbitAround: sun,
            orbitDistance: 5000,
            orbitSpeed: 0.002,
            orbitTilt: Math.PI * 0.01,
            surfaceFeatures: [
                { type: 'band', color: '#d18952', width: 10, offset: -20 },
                { type: 'band', color: '#bf7d3b', width: 15, offset: 15 },
                { type: 'spot', color: '#e74c3c', size: 15, position: new Vector(0.3, 0.1) }
            ]
        });
        this.bodies.push(jupiter);

        // Create Saturn
        const saturn = new CelestialBody({
            name: 'Saturn',
            mass: 5.683e4, // Scaled mass
            radius: 67,
            color: '#e0c088',
            hasAtmosphere: true,
            atmosphereColor: 'rgba(230, 200, 140, 0.3)',
            atmosphereHeight: 15,
            rotationSpeed: 0.1,
            orbitAround: sun,
            orbitDistance: 9000,
            orbitSpeed: 0.0015,
            orbitTilt: Math.PI * 0.05,
            rings: {
                innerRadius: 75,
                outerRadius: 120,
                color: 'rgba(210, 180, 140, 0.8)'
            }
        });
        this.bodies.push(saturn);
    }

    update(deltaTime) {
        // Update all celestial bodies
        for (const body of this.bodies) {
            body.update(deltaTime);
        }
    }

    // Get celestial body by name
    getBodyByName(name) {
        return this.bodies.find(body => body.name === name);
    }

    // Get all bodies that are currently visible in the viewport
    getVisibleBodies(camera) {
        // This would be implemented based on the camera's position and zoom level
        // For now, return all bodies
        return this.bodies;
    }
}
