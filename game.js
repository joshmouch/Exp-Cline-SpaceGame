// Game constants
const EARTH_RADIUS = 100;
const MOON_RADIUS = 30;
const SUN_RADIUS = 200;
const PLANET_RADII = {
    mercury: 20,
    venus: 40,
    mars: 35,
    jupiter: 150,
    saturn: 120
};
const ROCKET_HEIGHT = 20;
const ROCKET_WIDTH = 10;
const INITIAL_FUEL = 100;
const FUEL_CONSUMPTION_RATE = 0.2;
const ACCELERATION_RATE = 0.05;
const ROTATION_RATE = 0.05;
const GRAVITY_FACTOR = 0.001; // Low gravity to make escape easier
const SAFE_LANDING_VELOCITY = 1.0;
const TRAJECTORY_POINTS = 100;
const STAR_COUNT = 200;

// Game variables
let canvas, ctx;
let rocket = {
    x: 0,
    y: -EARTH_RADIUS - ROCKET_HEIGHT / 2,
    angle: 0, // Pointing upward
    velocity: { x: 0, y: 0 },
    fuel: INITIAL_FUEL,
    accelerating: false,
    landed: true,
    exploded: false
};
let camera = {
    x: 0,
    y: 0,
    zoom: 1,
    targetZoom: 1
};
let stars = [];
let clouds = [];
let waterTwinkles = [];
let trajectoryPoints = [];
let keysPressed = {};
let gameTime = 0;

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    
    // Generate stars
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * 4000 - 2000,
            y: Math.random() * 4000 - 2000,
            size: Math.random() * 2 + 1,
            twinkleSpeed: Math.random() * 0.05 + 0.01,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
    
    // Generate clouds
    for (let i = 0; i < 10; i++) {
        clouds.push({
            angle: Math.random() * Math.PI * 2,
            width: Math.random() * 40 + 20,
            height: Math.random() * 20 + 10,
            speed: (Math.random() * 0.0005 + 0.0002) * (Math.random() > 0.5 ? 1 : -1)
        });
    }
    
    // Generate water twinkles
    for (let i = 0; i < 30; i++) {
        waterTwinkles.push({
            angle: Math.random() * Math.PI * 2,
            latitude: Math.random() * Math.PI - Math.PI / 2,
            twinkleSpeed: Math.random() * 0.05 + 0.02,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
    
    // Set up event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', e => keysPressed[e.key] = true);
    window.addEventListener('keyup', e => keysPressed[e.key] = false);
    
    document.getElementById('accelerateBtn').addEventListener('click', toggleAcceleration);
    document.getElementById('leftBtn').addEventListener('mousedown', () => keysPressed['ArrowLeft'] = true);
    document.getElementById('leftBtn').addEventListener('mouseup', () => keysPressed['ArrowLeft'] = false);
    document.getElementById('leftBtn').addEventListener('mouseleave', () => keysPressed['ArrowLeft'] = false);
    document.getElementById('rightBtn').addEventListener('mousedown', () => keysPressed['ArrowRight'] = true);
    document.getElementById('rightBtn').addEventListener('mouseup', () => keysPressed['ArrowRight'] = false);
    document.getElementById('rightBtn').addEventListener('mouseleave', () => keysPressed['ArrowRight'] = false);
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function toggleAcceleration() {
    if (rocket.fuel > 0 && !rocket.exploded) {
        rocket.accelerating = !rocket.accelerating;
        document.getElementById('accelerateBtn').classList.toggle('active', rocket.accelerating);
    } else {
        rocket.accelerating = false;
        document.getElementById('accelerateBtn').classList.remove('active');
    }
}

function zoomIn() {
    camera.targetZoom = Math.min(camera.targetZoom * 1.5, 2);
}

function zoomOut() {
    camera.targetZoom = Math.max(camera.targetZoom / 1.5, 0.1);
}

function gameLoop(timestamp) {
    gameTime = timestamp / 1000;
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Handle keyboard input
    if (keysPressed['ArrowLeft']) {
        rocket.angle -= ROTATION_RATE;
    }
    if (keysPressed['ArrowRight']) {
        rocket.angle += ROTATION_RATE;
    }
    if (keysPressed[' '] && rocket.fuel > 0 && !rocket.exploded) {
        rocket.accelerating = true;
        document.getElementById('accelerateBtn').classList.add('active');
    } else if (keysPressed[' '] === false && rocket.accelerating) {
        rocket.accelerating = false;
        document.getElementById('accelerateBtn').classList.remove('active');
    }
    
    // Update rocket physics
    if (!rocket.landed && !rocket.exploded) {
        // Apply acceleration if rocket is accelerating
        if (rocket.accelerating && rocket.fuel > 0) {
            rocket.velocity.x += Math.sin(rocket.angle) * ACCELERATION_RATE;
            rocket.velocity.y -= Math.cos(rocket.angle) * ACCELERATION_RATE;
            rocket.fuel = Math.max(0, rocket.fuel - FUEL_CONSUMPTION_RATE);
            
            if (rocket.fuel <= 0) {
                rocket.accelerating = false;
                document.getElementById('accelerateBtn').classList.remove('active');
            }
        }
        
        // Apply gravity from Earth
        const distanceToEarth = Math.sqrt(rocket.x * rocket.x + rocket.y * rocket.y);
        const gravityForce = GRAVITY_FACTOR * (EARTH_RADIUS * EARTH_RADIUS) / (distanceToEarth * distanceToEarth);
        const gravityAngle = Math.atan2(rocket.y, rocket.x) - Math.PI / 2;
        
        rocket.velocity.x += Math.cos(gravityAngle) * gravityForce;
        rocket.velocity.y += Math.sin(gravityAngle) * gravityForce;
        
        // Apply gravity from other bodies when zoomed out
        if (camera.zoom < 0.5) {
            // Moon gravity
            const moonX = 500;
            const moonY = 500;
            const dxMoon = moonX - rocket.x;
            const dyMoon = moonY - rocket.y;
            const distanceToMoon = Math.sqrt(dxMoon * dxMoon + dyMoon * dyMoon);
            const moonGravity = GRAVITY_FACTOR * 0.5 * (MOON_RADIUS * MOON_RADIUS) / (distanceToMoon * distanceToMoon);
            const moonAngle = Math.atan2(dyMoon, dxMoon);
            
            rocket.velocity.x += Math.cos(moonAngle) * moonGravity;
            rocket.velocity.y += Math.sin(moonAngle) * moonGravity;
            
            // Sun gravity
            const sunX = -1500;
            const sunY = -1500;
            const dxSun = sunX - rocket.x;
            const dySun = sunY - rocket.y;
            const distanceToSun = Math.sqrt(dxSun * dxSun + dySun * dySun);
            const sunGravity = GRAVITY_FACTOR * 5 * (SUN_RADIUS * SUN_RADIUS) / (distanceToSun * distanceToSun);
            const sunAngle = Math.atan2(dySun, dxSun);
            
            rocket.velocity.x += Math.cos(sunAngle) * sunGravity;
            rocket.velocity.y += Math.sin(sunAngle) * sunGravity;
        }
        
        // Update position
        rocket.x += rocket.velocity.x;
        rocket.y += rocket.velocity.y;
        
        // Check for collision with Earth
        if (distanceToEarth < EARTH_RADIUS + ROCKET_HEIGHT / 2) {
            const speed = Math.sqrt(rocket.velocity.x * rocket.velocity.x + rocket.velocity.y * rocket.velocity.y);
            const landingAngle = Math.atan2(rocket.y, rocket.x) - Math.PI / 2;
            const angleDifference = Math.abs(normalizeAngle(rocket.angle - landingAngle));
            
            if (speed < SAFE_LANDING_VELOCITY && angleDifference < Math.PI / 4) {
                // Safe landing
                rocket.landed = true;
                rocket.velocity = { x: 0, y: 0 };
                const landingDistance = EARTH_RADIUS + ROCKET_HEIGHT / 2;
                rocket.x = Math.cos(landingAngle + Math.PI / 2) * landingDistance;
                rocket.y = Math.sin(landingAngle + Math.PI / 2) * landingDistance;
                rocket.angle = landingAngle;
            } else {
                // Crash landing
                rocket.exploded = true;
                rocket.velocity = { x: 0, y: 0 };
            }
        }
        
        // Check for collision with Moon when zoomed out
        if (camera.zoom < 0.5) {
            const moonX = 500;
            const moonY = 500;
            const dxMoon = moonX - rocket.x;
            const dyMoon = moonY - rocket.y;
            const distanceToMoon = Math.sqrt(dxMoon * dxMoon + dyMoon * dyMoon);
            
            if (distanceToMoon < MOON_RADIUS + ROCKET_HEIGHT / 2) {
                const speed = Math.sqrt(rocket.velocity.x * rocket.velocity.x + rocket.velocity.y * rocket.velocity.y);
                const landingAngle = Math.atan2(dyMoon, dxMoon) - Math.PI;
                const angleDifference = Math.abs(normalizeAngle(rocket.angle - landingAngle));
                
                if (speed < SAFE_LANDING_VELOCITY && angleDifference < Math.PI / 4) {
                    // Safe landing on Moon
                    rocket.landed = true;
                    rocket.velocity = { x: 0, y: 0 };
                    const landingDistance = MOON_RADIUS + ROCKET_HEIGHT / 2;
                    rocket.x = moonX + Math.cos(landingAngle) * landingDistance;
                    rocket.y = moonY + Math.sin(landingAngle) * landingDistance;
                    rocket.angle = landingAngle;
                } else {
                    // Crash landing on Moon
                    rocket.exploded = true;
                    rocket.velocity = { x: 0, y: 0 };
                }
            }
        }
    } else if (rocket.landed && !rocket.exploded) {
        // Launch from surface
        if (rocket.accelerating && rocket.fuel > 0) {
            rocket.landed = false;
            const launchAngle = rocket.angle;
            const launchDistance = EARTH_RADIUS + ROCKET_HEIGHT / 2 + 1; // +1 to avoid immediate collision
            rocket.x = Math.cos(launchAngle - Math.PI / 2) * launchDistance;
            rocket.y = Math.sin(launchAngle - Math.PI / 2) * launchDistance;
        }
    }
    
    // Update camera position to follow rocket
    camera.x += (rocket.x - camera.x) * 0.05;
    camera.y += (rocket.y - camera.y) * 0.05;
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.05;
    
    // Update clouds
    clouds.forEach(cloud => {
        cloud.angle += cloud.speed;
    });
    
    // Calculate trajectory
    calculateTrajectory();
    
    // Update UI
    document.getElementById('fuelLevel').textContent = Math.round(rocket.fuel);
    const altitude = Math.max(0, Math.sqrt(rocket.x * rocket.x + rocket.y * rocket.y) - EARTH_RADIUS);
    document.getElementById('altitude').textContent = Math.round(altitude);
    const velocity = Math.sqrt(rocket.velocity.x * rocket.velocity.x + rocket.velocity.y * rocket.velocity.y);
    document.getElementById('velocity').textContent = velocity.toFixed(2);
}

function calculateTrajectory() {
    if (rocket.landed || rocket.exploded) {
        trajectoryPoints = [];
        return;
    }
    
    trajectoryPoints = [];
    let simX = rocket.x;
    let simY = rocket.y;
    let simVelX = rocket.velocity.x;
    let simVelY = rocket.velocity.y;
    
    for (let i = 0; i < TRAJECTORY_POINTS; i++) {
        // Simulate gravity
        const distanceToEarth = Math.sqrt(simX * simX + simY * simY);
        const gravityForce = GRAVITY_FACTOR * (EARTH_RADIUS * EARTH_RADIUS) / (distanceToEarth * distanceToEarth);
        const gravityAngle = Math.atan2(simY, simX) - Math.PI / 2;
        
        simVelX += Math.cos(gravityAngle) * gravityForce;
        simVelY += Math.sin(gravityAngle) * gravityForce;
        
        // Update position
        simX += simVelX;
        simY += simVelY;
        
        // Check for collision with Earth
        if (Math.sqrt(simX * simX + simY * simY) < EARTH_RADIUS) {
            break;
        }
        
        trajectoryPoints.push({ x: simX, y: simY });
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up camera transform
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
    
    // Draw stars
    stars.forEach(star => {
        const twinkle = 0.5 + 0.5 * Math.sin(gameTime * star.twinkleSpeed + star.twinkleOffset);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw sun if zoomed out
    if (camera.zoom < 0.5) {
        const sunX = -1500;
        const sunY = -1500;
        const gradient = ctx.createRadialGradient(sunX, sunY, SUN_RADIUS * 0.5, sunX, sunY, SUN_RADIUS * 1.5);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, SUN_RADIUS * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff5c0';
        ctx.beginPath();
        ctx.arc(sunX, sunY, SUN_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw sun rays
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
        ctx.lineWidth = 5;
        for (let i = 0; i < 12; i++) {
            const angle = i * Math.PI / 6 + gameTime * 0.05;
            const innerRadius = SUN_RADIUS * 1.2;
            const outerRadius = SUN_RADIUS * 2;
            
            ctx.beginPath();
            ctx.moveTo(
                sunX + Math.cos(angle) * innerRadius,
                sunY + Math.sin(angle) * innerRadius
            );
            ctx.lineTo(
                sunX + Math.cos(angle) * outerRadius,
                sunY + Math.sin(angle) * outerRadius
            );
            ctx.stroke();
        }
        
        // Draw planets
        drawPlanet(-800, -400, PLANET_RADII.mercury, '#a9a9a9'); // Mercury
        drawPlanet(-400, -1000, PLANET_RADII.venus, '#e6c073'); // Venus
        drawPlanet(800, 800, PLANET_RADII.mars, '#c1440e'); // Mars
        drawPlanet(1500, 0, PLANET_RADII.jupiter, '#e0ae6f'); // Jupiter
        drawPlanet(0, 1800, PLANET_RADII.saturn, '#f4d4a9'); // Saturn
        
        // Draw moon
        drawMoon(500, 500);
    }
    
    // Draw Earth
    drawEarth();
    
    // Draw trajectory
    if (trajectoryPoints.length > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rocket.x, rocket.y);
        trajectoryPoints.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
    }
    
    // Draw rocket
    if (!rocket.exploded) {
        ctx.save();
        ctx.translate(rocket.x, rocket.y);
        ctx.rotate(rocket.angle);
        
        // Rocket body
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.moveTo(0, -ROCKET_HEIGHT / 2);
        ctx.lineTo(ROCKET_WIDTH / 2, ROCKET_HEIGHT / 2);
        ctx.lineTo(-ROCKET_WIDTH / 2, ROCKET_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();
        
        // Rocket window
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(0, -ROCKET_HEIGHT / 6, ROCKET_WIDTH / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Rocket fins
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(ROCKET_WIDTH / 2, ROCKET_HEIGHT / 3);
        ctx.lineTo(ROCKET_WIDTH, ROCKET_HEIGHT / 2);
        ctx.lineTo(ROCKET_WIDTH / 2, ROCKET_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-ROCKET_WIDTH / 2, ROCKET_HEIGHT / 3);
        ctx.lineTo(-ROCKET_WIDTH, ROCKET_HEIGHT / 2);
        ctx.lineTo(-ROCKET_WIDTH / 2, ROCKET_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();
        
        // Rocket flame
        if (rocket.accelerating && rocket.fuel > 0) {
            const flameHeight = ROCKET_HEIGHT * (0.5 + Math.random() * 0.2);
            const gradient = ctx.createLinearGradient(0, ROCKET_HEIGHT / 2, 0, ROCKET_HEIGHT / 2 + flameHeight);
            gradient.addColorStop(0, '#f97316');
            gradient.addColorStop(0.6, '#f59e0b');
            gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(-ROCKET_WIDTH / 3, ROCKET_HEIGHT / 2);
            ctx.lineTo(0, ROCKET_HEIGHT / 2 + flameHeight);
            ctx.lineTo(ROCKET_WIDTH / 3, ROCKET_HEIGHT / 2);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    } else {
        // Draw explosion
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, ROCKET_HEIGHT, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, ROCKET_HEIGHT * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawEarth() {
    // Earth base
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, 0, EARTH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Earth land masses
    ctx.fillStyle = '#10b981';
    
    // North America
    drawLandmass(-0.2, -0.3, 0.3, 0.25);
    
    // South America
    drawLandmass(-0.1, 0.1, 0.15, 0.3);
    
    // Europe and Africa
    drawLandmass(0.2, -0.1, 0.25, 0.5);
    
    // Asia and Australia
    drawLandmass(0.5, -0.2, 0.4, 0.4);
    
    // Water twinkles
    waterTwinkles.forEach(twinkle => {
        const brightness = 0.5 + 0.5 * Math.sin(gameTime * twinkle.twinkleSpeed + twinkle.twinkleOffset);
        const x = Math.cos(twinkle.angle) * Math.cos(twinkle.latitude) * EARTH_RADIUS;
        const y = Math.sin(twinkle.angle) * Math.cos(twinkle.latitude) * EARTH_RADIUS;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Clouds
    clouds.forEach(cloud => {
        const x = Math.cos(cloud.angle) * EARTH_RADIUS;
        const y = Math.sin(cloud.angle) * EARTH_RADIUS;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(x, y, cloud.width, cloud.height, cloud.angle, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawLandmass(centerX, centerY, width, height) {
    const x = centerX * EARTH_RADIUS;
    const y = centerY * EARTH_RADIUS;
    const w = width * EARTH_RADIUS;
    const h = height * EARTH_RADIUS;
    
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawMoon(x, y) {
    // Moon base
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.arc(x, y, MOON_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon craters
    ctx.fillStyle = '#9ca3af';
    
    // Draw several craters
    drawCrater(x - MOON_RADIUS * 0.3, y - MOON_RADIUS * 0.2, MOON_RADIUS * 0.15);
    drawCrater(x + MOON_RADIUS * 0.4, y + MOON_RADIUS * 0.3, MOON_RADIUS * 0.2);
    drawCrater(x - MOON_RADIUS * 0.1, y + MOON_RADIUS * 0.4, MOON_RADIUS * 0.1);
    drawCrater(x + MOON_RADIUS * 0.2, y - MOON_RADIUS * 0.4, MOON_RADIUS * 0.12);
}

function drawCrater(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlanet(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add simple shading
    const gradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

// Start the game when the page loads
window.addEventListener('load', init);
