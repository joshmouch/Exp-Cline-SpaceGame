/**
 * Renderer class for handling all visual aspects of the game
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resizeCanvas();
        
        // Camera properties
        this.camera = {
            position: new Vector(),
            zoom: 1,
            targetZoom: 1,
            zoomSpeed: 0.1,
            minZoom: 0.1,
            maxZoom: 5
        };
        
        // Visual effects
        this.stars = this.generateStars(500);
        this.twinkleSpeed = 0.5;
        this.twinkleTime = 0;
        
        // Textures and images
        this.textures = {};
        this.loadTextures();
        
        // Bind resize event
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    loadTextures() {
        // This would load actual image textures in a real implementation
        // For now, we'll use procedural textures
        this.textures = {
            earth: null,
            moon: null,
            sun: null,
            stars: null
        };
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * 10000 - 5000,
                y: Math.random() * 10000 - 5000,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.5 + 0.5,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
        return stars;
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(position) {
        const relativePos = position.subtract(this.camera.position);
        return {
            x: this.centerX + relativePos.x * this.camera.zoom,
            y: this.centerY + relativePos.y * this.camera.zoom
        };
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(x, y) {
        return new Vector(
            (x - this.centerX) / this.camera.zoom + this.camera.position.x,
            (y - this.centerY) / this.camera.zoom + this.camera.position.y
        );
    }

    // Set camera to follow a target
    followTarget(target, offset = new Vector()) {
        this.camera.position = target.position.add(offset);
    }

    // Set camera zoom level
    setZoom(zoom) {
        this.camera.targetZoom = Math.max(
            this.camera.minZoom,
            Math.min(this.camera.maxZoom, zoom)
        );
    }

    // Zoom in by a factor
    zoomIn() {
        this.setZoom(this.camera.targetZoom * 1.2);
    }

    // Zoom out by a factor
    zoomOut() {
        this.setZoom(this.camera.targetZoom / 1.2);
    }

    // Clear the canvas
    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Update visual effects
    update(deltaTime) {
        // Update camera zoom with smooth transition
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * this.camera.zoomSpeed;
        
        // Update twinkle effect
        this.twinkleTime += deltaTime * this.twinkleSpeed;
    }

    // Render the entire scene
    render(game) {
        this.clear();
        
        // Render stars with twinkling effect
        this.renderStars();
        
        // Render celestial bodies
        const visibleBodies = game.solarSystem.getVisibleBodies(this.camera);
        
        // Sort bodies by size for proper layering (smaller in front)
        visibleBodies.sort((a, b) => b.radius - a.radius);
        
        // Render bodies
        for (const body of visibleBodies) {
            this.renderCelestialBody(body);
        }
        
        // Render spacecraft
        this.renderSpacecraft(game.spacecraft);
        
        // Render trajectory prediction
        this.renderTrajectory(game.trajectoryPoints);
        
        // Render UI elements
        this.renderUI(game);
    }

    renderStars() {
        this.ctx.save();
        
        for (const star of this.stars) {
            // Calculate star position on screen
            const screenPos = this.worldToScreen(new Vector(star.x, star.y));
            
            // Skip stars outside the viewport
            if (screenPos.x < -10 || screenPos.x > this.canvas.width + 10 ||
                screenPos.y < -10 || screenPos.y > this.canvas.height + 10) {
                continue;
            }
            
            // Calculate twinkling effect
            const twinkle = Math.sin(this.twinkleTime + star.twinklePhase) * 0.2 + 0.8;
            const brightness = star.brightness * twinkle;
            
            // Draw star
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, star.size * this.camera.zoom, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow for brighter stars
            if (star.size > 1.5) {
                this.ctx.globalAlpha = brightness * 0.5;
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, star.size * 2 * this.camera.zoom, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        }
        
        this.ctx.restore();
    }

    renderCelestialBody(body) {
        const screenPos = this.worldToScreen(body.position);
        const screenRadius = body.radius * this.camera.zoom;
        
        // Skip if not visible on screen
        if (screenPos.x + screenRadius < 0 || screenPos.x - screenRadius > this.canvas.width ||
            screenPos.y + screenRadius < 0 || screenPos.y - screenRadius > this.canvas.height) {
            return;
        }
        
        this.ctx.save();
        
        // Draw atmosphere if present
        if (body.hasAtmosphere) {
            const atmosphereRadius = (body.radius + body.atmosphereHeight) * this.camera.zoom;
            const gradient = this.ctx.createRadialGradient(
                screenPos.x, screenPos.y, screenRadius,
                screenPos.x, screenPos.y, atmosphereRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, body.atmosphereColor);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, atmosphereRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw rings if present (e.g., Saturn)
        if (body.rings) {
            const innerRadius = body.rings.innerRadius * this.camera.zoom;
            const outerRadius = body.rings.outerRadius * this.camera.zoom;
            
            this.ctx.fillStyle = body.rings.color;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, outerRadius, 0, Math.PI * 2);
            this.ctx.arc(screenPos.x, screenPos.y, innerRadius, 0, Math.PI * 2, true);
            this.ctx.fill();
        }
        
        // Draw the celestial body
        if (body.name === 'Sun') {
            // Special rendering for the sun with rays
            this.renderSun(body, screenPos, screenRadius);
        } else if (body.name === 'Earth') {
            // Special rendering for Earth with water and clouds
            this.renderEarth(body, screenPos, screenRadius);
        } else {
            // Standard rendering for other bodies
            this.ctx.fillStyle = body.color;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw surface features if any
            if (body.surfaceFeatures && body.surfaceFeatures.length > 0) {
                this.renderSurfaceFeatures(body, screenPos, screenRadius);
            }
        }
        
        this.ctx.restore();
    }

    renderSun(sun, screenPos, screenRadius) {
        // Create radial gradient for sun glow
        const gradient = this.ctx.createRadialGradient(
            screenPos.x, screenPos.y, screenRadius * 0.7,
            screenPos.x, screenPos.y, screenRadius * 1.2
        );
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.4, '#ffdd00');
        gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
        
        // Draw sun with gradient
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, screenRadius * 1.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw sun core
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, screenRadius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw sun rays
        this.ctx.strokeStyle = 'rgba(255, 255, 150, 0.3)';
        this.ctx.lineWidth = 2;
        
        const rayCount = 12;
        const rayLength = screenRadius * 1.5;
        const time = this.twinkleTime * 0.2;
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2 + time;
            const innerRadius = screenRadius * 1.1;
            const outerRadius = innerRadius + rayLength * (0.8 + Math.sin(time + i) * 0.2);
            
            this.ctx.beginPath();
            this.ctx.moveTo(
                screenPos.x + Math.cos(angle) * innerRadius,
                screenPos.y + Math.sin(angle) * innerRadius
            );
            this.ctx.lineTo(
                screenPos.x + Math.cos(angle) * outerRadius,
                screenPos.y + Math.sin(angle) * outerRadius
            );
            this.ctx.stroke();
        }
        
        // Draw sun spots
        for (const feature of sun.surfaceFeatures) {
            if (feature.type === 'sunspot') {
                const spotX = screenPos.x + feature.position.x * screenRadius * 0.7;
                const spotY = screenPos.y + feature.position.y * screenRadius * 0.7;
                const spotSize = feature.size * this.camera.zoom;
                
                this.ctx.fillStyle = 'rgba(200, 100, 0, 0.7)';
                this.ctx.beginPath();
                this.ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    renderEarth(earth, screenPos, screenRadius) {
        // Base color
        this.ctx.fillStyle = earth.color;
        this.ctx.beginPath();
        this.ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw land masses (simplified)
        this.ctx.fillStyle = '#2e7d32'; // Green for land
        
        // Simplified continents
        const continents = [
            { // North America
                path: [
                    {x: -0.3, y: -0.5},
                    {x: -0.1, y: -0.4},
                    {x: -0.2, y: -0.1},
                    {x: -0.5, y: 0},
                    {x: -0.6, y: -0.3}
                ]
            },
            { // South America
                path: [
                    {x: -0.2, y: 0.1},
                    {x: -0.1, y: 0.5},
                    {x: -0.3, y: 0.6},
                    {x: -0.4, y: 0.3}
                ]
            },
            { // Europe/Africa
                path: [
                    {x: 0.1, y: -0.5},
                    {x: 0.2, y: -0.2},
                    {x: 0.1, y: 0.5},
                    {x: -0.1, y: 0.6},
                    {x: -0.1, y: 0},
                    {x: 0, y: -0.3}
                ]
            },
            { // Asia/Australia
                path: [
                    {x: 0.2, y: -0.4},
                    {x: 0.6, y: -0.3},
                    {x: 0.5, y: 0.1},
                    {x: 0.4, y: 0.4},
                    {x: 0.2, y: 0.2}
                ]
            }
        ];
        
        // Draw each continent
        for (const continent of continents) {
            this.ctx.beginPath();
            
            // Rotate based on Earth's rotation
            const rotatedPoints = continent.path.map(point => {
                const angle = earth.rotationAngle;
                return {
                    x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
                    y: point.x * Math.sin(angle) + point.y * Math.cos(angle)
                };
            });
            
            // Draw the continent path
            this.ctx.moveTo(
                screenPos.x + rotatedPoints[0].x * screenRadius,
                screenPos.y + rotatedPoints[0].y * screenRadius
            );
            
            for (let i = 1; i < rotatedPoints.length; i++) {
                this.ctx.lineTo(
                    screenPos.x + rotatedPoints[i].x * screenRadius,
                    screenPos.y + rotatedPoints[i].y * screenRadius
                );
            }
            
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Draw twinkling water
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
        
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 0.8 * screenRadius;
            const size = Math.random() * 3 + 1;
            const x = screenPos.x + Math.cos(angle) * distance;
            const y = screenPos.y + Math.sin(angle) * distance;
            
            // Only draw if not on land (simplified check)
            const isOnLand = false; // Would check against continent paths
            
            if (!isOnLand) {
                this.ctx.globalAlpha = 0.3 + Math.sin(this.twinkleTime * 2 + i) * 0.2;
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.globalAlpha = 1;
        
        // Draw clouds
        this.renderClouds(earth, screenPos, screenRadius);
    }

    renderClouds(earth, screenPos, screenRadius) {
        const cloudCount = 8;
        const cloudOffset = earth.cloudOffset;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        for (let i = 0; i < cloudCount; i++) {
            const baseAngle = (i / cloudCount) * Math.PI * 2;
            const angle = baseAngle + cloudOffset;
            const x = screenPos.x + Math.cos(angle) * screenRadius * 0.9;
            const y = screenPos.y + Math.sin(angle) * screenRadius * 0.9;
            const cloudWidth = (Math.random() * 0.3 + 0.2) * screenRadius;
            const cloudHeight = (Math.random() * 0.1 + 0.05) * screenRadius;
            
            // Draw cloud as a collection of circles
            const segments = 5;
            for (let j = 0; j < segments; j++) {
                const segmentX = x + (j / segments - 0.5) * cloudWidth;
                const segmentY = y + Math.sin(j / segments * Math.PI) * cloudHeight;
                const segmentSize = (0.05 + Math.sin(j / segments * Math.PI) * 0.05) * screenRadius;
                
                this.ctx.beginPath();
                this.ctx.arc(segmentX, segmentY, segmentSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    renderSurfaceFeatures(body, screenPos, screenRadius) {
        for (const feature of body.surfaceFeatures) {
            // Rotate feature position based on body rotation
            const rotatedPos = {
                x: feature.position.x * Math.cos(body.rotationAngle) - feature.position.y * Math.sin(body.rotationAngle),
                y: feature.position.x * Math.sin(body.rotationAngle) + feature.position.y * Math.cos(body.rotationAngle)
            };
            
            const featureX = screenPos.x + rotatedPos.x * screenRadius;
            const featureY = screenPos.y + rotatedPos.y * screenRadius;
            
            if (feature.type === 'crater') {
                // Draw crater
                const craterSize = feature.size * this.camera.zoom;
                
                this.ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(featureX, featureY, craterSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw crater rim highlight
                this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(featureX, featureY, craterSize, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (feature.type === 'band') {
                // Draw band (for gas giants)
                const bandWidth = feature.width * this.camera.zoom;
                const bandOffset = feature.offset * this.camera.zoom;
                
                this.ctx.fillStyle = feature.color;
                this.ctx.beginPath();
                this.ctx.ellipse(
                    screenPos.x, screenPos.y + bandOffset,
                    screenRadius, bandWidth / 2,
                    0, 0, Math.PI * 2
                );
                this.ctx.fill();
            } else if (feature.type === 'spot') {
                // Draw spot (like Jupiter's Great Red Spot)
                const spotSize = feature.size * this.camera.zoom;
                
                this.ctx.fillStyle = feature.color;
                this.ctx.beginPath();
                this.ctx.ellipse(
                    featureX, featureY,
                    spotSize, spotSize * 0.6,
                    body.rotationAngle, 0, Math.PI * 2
                );
                this.ctx.fill();
            }
        }
    }

    renderSpacecraft(spacecraft) {
        // Skip if crashed
        if (spacecraft.crashed) {
            this.renderCrashedSpacecraft(spacecraft);
            return;
        }
        
        const screenPos = this.worldToScreen(spacecraft.position);
        const size = spacecraft.size * this.camera.zoom;
        
        this.ctx.save();
        this.ctx.translate(screenPos.x, screenPos.y);
        this.ctx.rotate(spacecraft.angle);
        
        // Draw spacecraft body
        this.ctx.fillStyle = '#dddddd';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size / 2, size / 2);
        this.ctx.lineTo(-size / 2, size / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw spacecraft details
        this.ctx.fillStyle = '#999999';
        this.ctx.beginPath();
        this.ctx.rect(-size / 4, -size / 2, size / 2, size / 4);
        this.ctx.fill();
        
        // Draw thruster flame if thrusting
        if (spacecraft.thrusting) {
            this.ctx.fillStyle = '#ff5500';
            this.ctx.beginPath();
            this.ctx.moveTo(-size / 4, size / 2);
            this.ctx.lineTo(size / 4, size / 2);
            this.ctx.lineTo(0, size);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Inner flame
            this.ctx.fillStyle = '#ffdd00';
            this.ctx.beginPath();
            this.ctx.moveTo(-size / 8, size / 2);
            this.ctx.lineTo(size / 8, size / 2);
            this.ctx.lineTo(0, size * 0.8);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Draw landing gear if deployed
        if (spacecraft.landingGearDeployed) {
            this.ctx.strokeStyle = '#aaaaaa';
            this.ctx.lineWidth = 2;
            
            // Left leg
            this.ctx.beginPath();
            this.ctx.moveTo(-size / 3, 0);
            this.ctx.lineTo(-size / 2, size);
            this.ctx.stroke();
            
            // Right leg
            this.ctx.beginPath();
            this.ctx.moveTo(size / 3, 0);
            this.ctx.lineTo(size / 2, size);
            this.ctx.stroke();
            
            // Center leg
            this.ctx.beginPath();
            this.ctx.moveTo(0, size / 2);
            this.ctx.lineTo(0, size);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        
        // Render exhaust particles
        this.renderExhaustParticles(spacecraft);
        
        // Render trail
        this.renderTrail(spacecraft);
    }

    renderCrashedSpacecraft(spacecraft) {
        const screenPos = this.worldToScreen(spacecraft.position);
        const size = spacecraft.size * this.camera.zoom;
        
        this.ctx.save();
        this.ctx.translate(screenPos.x, screenPos.y);
        this.ctx.rotate(spacecraft.angle);
        
        // Draw crashed spacecraft (broken parts)
        this.ctx.fillStyle = '#999999';
        
        // Draw scattered debris
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size;
            const debrisSize = Math.random() * (size / 4) + (size / 8);
            
            this.ctx.save();
            this.ctx.translate(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance
            );
            this.ctx.rotate(Math.random() * Math.PI * 2);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -debrisSize / 2);
            this.ctx.lineTo(debrisSize / 2, debrisSize / 2);
            this.ctx.lineTo(-debrisSize / 2, debrisSize / 2);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        // Draw main wreckage
        this.ctx.fillStyle = '#777777';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size / 2);
        this.ctx.lineTo(size / 3, 0);
        this.ctx.lineTo(-size / 3, size / 4);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }

    renderExhaustParticles(spacecraft) {
        for (const particle of spacecraft.exhaustParticles) {
            const screenPos = this.worldToScreen(particle.position);
            const size = particle.size * this.camera.zoom;
            
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    }

    renderTrail(spacecraft) {
        if (spacecraft.trail.length < 2) {
            return;
        }
        
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const firstPoint = this.worldToScreen(spacecraft.trail[0]);
        this.ctx.moveTo(firstPoint.x, firstPoint.y);
        
        for (let i = 1; i < spacecraft.trail.length; i++) {
            const point = this.worldToScreen(spacecraft.trail[i]);
            this.ctx.lineTo(point.x, point.y);
        }
        
        this.ctx.stroke();
    }

    renderTrajectory(trajectoryPoints) {
        if (!trajectoryPoints || trajectoryPoints.length < 2) {
            return;
        }
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        
        const firstPoint = this.worldToScreen(trajectoryPoints[0]);
        this.ctx.moveTo(firstPoint.x, firstPoint.y);
        
        for (let i = 1; i < trajectoryPoints.length; i++) {
            const point = this.worldToScreen(trajectoryPoints[i]);
            this.ctx.lineTo(point.x, point.y);
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    renderUI(game) {
        // UI elements are rendered directly in HTML for better performance
        // This method would update any canvas-based UI elements
        
        // Update fuel bar
        const fuelBar = document.getElementById('fuelBar');
        if (fuelBar) {
            fuelBar.style.width = `${game.spacecraft.getFuelPercentage()}%`;
        }
        
        // Update velocity display
        const velocityDisplay = document.getElementById('velocity');
        if (velocityDisplay) {
            const speed = Math.round(game.spacecraft.getSpeed() * 10) / 10;
            velocityDisplay.textContent = `${speed} m/s`;
        }
        
        // Update altitude display
        const altitudeDisplay = document.getElementById('altitude');
        if (altitudeDisplay) {
            // Find closest celestial body
            let closestBody = null;
            let closestDistance = Infinity;
            
            for (const body of game.solarSystem.bodies) {
                const distance = game.spacecraft.position.distance(body.position) - body.radius;
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestBody = body;
                }
            }
            
            const altitude = Math.round(closestDistance * 10) / 10;
            altitudeDisplay.textContent = `${altitude} km`;
        }
    }
}
