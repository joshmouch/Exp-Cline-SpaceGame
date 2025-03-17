# Rocket Position Fix

## Summary of Changes

To fix the rocket position bug where the ship was starting nose-down at the 10 o'clock position instead of nose-up at the 12 o'clock position, the following key changes were made:

1. **Fixed the angle calculation confusion**:
   - The most critical issue was that the `drawRocket()` function applies an adjustment of `(rocket.angle - Math.PI/2)` to the rocket's orientation
   - We were setting `rocket.angle = -Math.PI` to point up, but with the drawing adjustment this actually pointed the rocket down
   - Changed all angle settings to use `0` for pointing straight up to account for the drawing function's adjustment

2. **Consistent initialization and reset**:
   - Both the `init()` and `resetGame()` functions now use a fixed initial time (0) for orbital calculations
   - Planets are positioned consistently on every game start and reset
   - The rocket is explicitly positioned at the 12 o'clock position with its nose up

3. **Special handling for 12 o'clock positions**:
   - Added special case handling everywhere the rocket interacts with Earth
   - When the rocket is at the top of Earth (12 o'clock), it's positioned exactly at x=earth.x, y=earth.y-radius-height/2-margin
   - The rocket angle is consistently set to `0` (pointing straight up) at the top of Earth

4. **Collision prevention**:
   - Added a 1-pixel margin in all positioning calculations to prevent the rocket from colliding with Earth
   - Modified the `updateOrbits()` function to handle the rocket positioning separately after updating all celestial bodies

## Implementation Details

The key insight was understanding the relationship between the rocket's angle property and its visual orientation:

1. In the `drawRocket()` function, there is a crucial line:
   ```javascript
   ctx.rotate(rocket.angle - Math.PI / 2); // Adjust to face upward by default
   ```

2. This means:
   - When `rocket.angle = 0`, the rocket points straight up (12 o'clock)
   - When `rocket.angle = Math.PI/2`, the rocket points right (3 o'clock)
   - When `rocket.angle = Math.PI`, the rocket points down (6 o'clock)
   - When `rocket.angle = -Math.PI/2`, the rocket points left (9 o'clock)

3. Previously, we were setting `rocket.angle = -Math.PI` to try to make it point up, but this actually made it point down due to the rotation adjustment in the drawing function.

## Visual Demonstration

When the game loads or is reset, the rocket should now consistently appear at the top of Earth (12 o'clock position) with its nose pointing straight up.

Test screenshots demonstrate:
1. Initial state shows rocket at 12 o'clock, nose-up
2. After reset, rocket returns to exact same position
3. After browser refresh, rocket appears in same position
