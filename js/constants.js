// Game constants
const ROCKET_HEIGHT = 20;
const ROCKET_WIDTH = 10;
const INITIAL_FUEL = 200;
const FUEL_CONSUMPTION_RATE = 0.1;
const ACCELERATION_RATE = 0.005; // Increased from 0.01 to make movement more noticeable
const ROTATION_RATE = 0.05;
const TRAJECTORY_POINTS = 4000; // Number of points in trajectory
const TRAJECTORY_SKIP = 20; // Only show every nth dot
const STAR_COUNT = 200;
const SAFE_LANDING_VELOCITY = 1.0;

// Camera constants
const MIN_ZOOM = 0.02;
const MAX_ZOOM = 2.0;

// Physics constants
const GRAVITY_FACTOR = 0.002;
const MIN_GRAVITY_THRESHOLD = 0.0001; // Increased minimum threshold to reduce jitter from tiny forces

// Celestial bodies
const CELESTIAL_BODIES = {
    EARTH: {
        name: 'earth',
        radius: 150,
        gravity: 1.0,  // Reduced to make it easier to escape
        position: { x: 0, y: 0 },
        color: '#3498db'
    },
    MOON: {
        name: 'moon',
        radius: 40,
        gravity: 0.2,
        position: { x: 500, y: 500 },
        color: '#bdc3c7'
    },
    SUN: {
        name: 'sun',
        radius: 200,
        gravity: 10.0,  // Strong but not as strong as Earth at close range
        position: { x: -1500, y: -1500 },
        color: '#f39c12'
    },
    MERCURY: {
        name: 'mercury',
        radius: 20,
        gravity: 0.3,
        position: { x: -800, y: -400 },
        color: '#95a5a6'
    },
    VENUS: {
        name: 'venus',
        radius: 40,
        gravity: 0.7,
        position: { x: -400, y: -1000 },
        color: '#e67e22'
    },
    MARS: {
        name: 'mars',
        radius: 35,
        gravity: 0.6,
        position: { x: 800, y: 800 },
        color: '#e74c3c'
    },
    JUPITER: {
        name: 'jupiter',
        radius: 150,
        gravity: 5.0,
        position: { x: 1500, y: 0 },
        color: '#f1c40f'
    },
    SATURN: {
        name: 'saturn',
        radius: 120,
        gravity: 2.0,
        position: { x: 0, y: 1800 },
        color: '#d35400'
    }
};

// Create an array of all celestial bodies for easy iteration
const ALL_CELESTIAL_BODIES = Object.values(CELESTIAL_BODIES);

// Sort celestial bodies by gravity (strongest first) for gravity calculations
const SORTED_CELESTIAL_BODIES = [...ALL_CELESTIAL_BODIES].sort((a, b) => b.gravity - a.gravity);
