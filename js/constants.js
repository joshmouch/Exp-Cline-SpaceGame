// Game constants
const ROCKET_HEIGHT = 20;
const ROCKET_WIDTH = 10;
const INITIAL_FUEL = 100;
const FUEL_CONSUMPTION_RATE = 0.01;
const ACCELERATION_RATE = 0.002; // Increased for better control
const ROTATION_RATE = 0.05;
const TRAJECTORY_POINTS = 4000; // Number of points in trajectory
const TRAJECTORY_SKIP = 20; // Only show every nth dot
const STAR_COUNT = 200;
const SAFE_LANDING_VELOCITY = 1.0;

// Camera constants
const MIN_ZOOM = 0.02;
const MAX_ZOOM = 2.0;

// Physics constants
const GRAVITY_FACTOR = 0.001; // Factor used to calculate the gravitational force exerted on the rocket by celestial bodies, affecting its acceleration and trajectory.
const MIN_GRAVITY_THRESHOLD = 0.0; // Ignore tiny forces from small or distant objects
const GRAVITY_SURFACE_DECAY_FACTOR = 0; // Factor to control how gravity decreases with distance (using surfaces rather than centers) (e.g., distance^2 is real gravity, but distance^3 lets planets be closer together without affecting each other)
const GRAVITY_DECAY_FACTOR = -2; // Factor to control how gravity decreases with distance (e.g., distance^2 is real gravity, but distance^3 lets planets be closer together without affecting each other)

// Celestial bodies
const CELESTIAL_BODIES = {
    EARTH: {
        name: 'earth',
        radius: 150,
        gravity: 1.0,  // Reduced to make it easier to escape
        position: { x: 640, y: 360 }, // Center position for 1280x720 viewport
        color: '#3498db',
        orbits: 'SUN',
        orbitRadius: 2000,
        orbitSpeed: 0.0001,
        orbitPhase: 0
    },
    MOON: {
        name: 'moon',
        radius: 40,
        gravity: 1,
        position: { x: 500, y: 500 },
        color: '#bdc3c7',
        orbits: 'EARTH',
        orbitRadius: 500,
        orbitSpeed: 0.0005,
        orbitPhase: 0
    },
    SUN: {
        name: 'sun',
        radius: 200,
        gravity: 1,  // Strong but not as strong as Earth at close range
        position: { x: -1500, y: -1500 },
        color: '#f39c12',
        orbits: null,  // The sun doesn't orbit anything
        orbitRadius: 0,
        orbitSpeed: 0,
        orbitPhase: 0
    },
    MERCURY: {
        name: 'mercury',
        radius: 20,
        gravity: 1,
        position: { x: -800, y: -400 },
        color: '#95a5a6',
        orbits: 'SUN',
        orbitRadius: 1000,
        orbitSpeed: 0.0003,
        orbitPhase: 1.5
    },
    VENUS: {
        name: 'venus',
        radius: 40,
        gravity: 1,
        position: { x: -400, y: -1000 },
        color: '#e67e22',
        orbits: 'SUN',
        orbitRadius: 1500,
        orbitSpeed: 0.00015,
        orbitPhase: 3.2
    },
    MARS: {
        name: 'mars',
        radius: 35,
        gravity: 1,
        position: { x: 800, y: 800 },
        color: '#e74c3c',
        orbits: 'SUN',
        orbitRadius: 2500,
        orbitSpeed: 0.00008,
        orbitPhase: 4.7
    },
    JUPITER: {
        name: 'jupiter',
        radius: 150,
        gravity: 1,
        position: { x: 1500, y: 0 },
        color: '#f1c40f',
        orbits: 'SUN',
        orbitRadius: 3500,
        orbitSpeed: 0.00004,
        orbitPhase: 0.8
    },
    SATURN: {
        name: 'saturn',
        radius: 120,
        gravity: 1,
        position: { x: 0, y: 1800 },
        color: '#d35400',
        orbits: 'SUN',
        orbitRadius: 4500,
        orbitSpeed: 0.00003,
        orbitPhase: 2.1
    },
    URANUS: {
        name: 'uranus',
        radius: 90,
        gravity: 1,
        position: { x: -2500, y: 1000 },
        color: '#1abc9c',  // Cyan/teal color for Uranus
        orbits: 'SUN',
        orbitRadius: 5500,
        orbitSpeed: 0.00002,
        orbitPhase: 5.3
    },
    NEPTUNE: {
        name: 'neptune',
        radius: 85,
        gravity: 1,
        position: { x: 2000, y: -2000 },
        color: '#3498db',  // Deep blue color for Neptune
        orbits: 'SUN',
        orbitRadius: 6500,
        orbitSpeed: 0.000015,
        orbitPhase: 0.5
    }
};

// Create an array of all celestial bodies for easy iteration
const ALL_CELESTIAL_BODIES = Object.values(CELESTIAL_BODIES);

// Sort celestial bodies by gravity (strongest first) for gravity calculations
const SORTED_CELESTIAL_BODIES = [...ALL_CELESTIAL_BODIES].sort((a, b) => b.gravity - a.gravity);
