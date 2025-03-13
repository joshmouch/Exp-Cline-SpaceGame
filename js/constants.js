// Game constants
const EARTH_RADIUS = 150;
const MOON_RADIUS = 40;
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
const INITIAL_FUEL = 200;
const FUEL_CONSUMPTION_RATE = 0.1;
const ACCELERATION_RATE = 0.01;
const ROTATION_RATE = 0.05;
const GRAVITY_FACTOR = 0.01;
const SAFE_LANDING_VELOCITY = 1.0;
const TRAJECTORY_POINTS = 200;
const STAR_COUNT = 200;

// Planet positions
const MOON_POSITION = { x: 500, y: 500 };
const SUN_POSITION = { x: -1500, y: -1500 };
const PLANET_POSITIONS = {
    mercury: { x: -800, y: -400 },
    venus: { x: -400, y: -1000 },
    mars: { x: 800, y: 800 },
    jupiter: { x: 1500, y: 0 },
    saturn: { x: 0, y: 1800 }
};
