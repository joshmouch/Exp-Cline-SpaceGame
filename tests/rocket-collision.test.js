// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Rocket Collision and Position Tests', () => {
  test('Rocket should start with nose-up at 12 o\'clock position and handle collisions correctly', async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:5500');
    
    // Wait for the game to initialize
    await page.waitForSelector('#gameCanvas', { state: 'visible' });
    await page.waitForTimeout(1000); // Give the game time to fully initialize
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'tests/rocket-collision.test-results/initial-state.png' });
    
    // Create directory for test results if it doesn't exist
    await page.evaluate(() => {
      try {
        if (typeof window.fs !== 'undefined' && typeof window.fs.mkdir === 'function') {
          window.fs.mkdir('tests/rocket-collision.test-results', { recursive: true });
        }
      } catch (e) {
        console.error('Error creating directory:', e);
      }
    });
    
    // Define helper function to get game state
    const getGameState = async () => {
      return await page.evaluate(() => {
        return window.gameState;
      });
    };
    
    // Reset the game to ensure a clean state
    await page.click('#resetBtn');
    await page.waitForTimeout(500); // Give time for the reset to take effect
    
    // Take a screenshot after reset
    await page.screenshot({ path: 'tests/rocket-collision.test-results/after-reset.png' });
    
    const initialState = await getGameState();
    
    // Check initial rocket position - should be at the top of Earth
    const earthPosX = initialState.rocket.onBody.position.x;
    const earthPosY = initialState.rocket.onBody.position.y;
    const earthRadius = initialState.rocket.onBody.radius;
    const initialRocketX = initialState.rocket.x;
    const initialRocketY = initialState.rocket.y;
    
    // Verify initial rocket position is at the top of Earth
    const distanceToEarthCenter = Math.sqrt(
      Math.pow(initialRocketX - earthPosX, 2) + 
      Math.pow(initialRocketY - earthPosY, 2)
    );
    expect(Math.abs(distanceToEarthCenter - (earthRadius + 20/2))).toBeLessThan(2); // Allowing small rounding error
    
    // Calculate the angle from Earth center to the rocket (should be approximately -PI/2 for top of Earth)
    const angleToEarth = Math.atan2(initialRocketY - earthPosY, initialRocketX - earthPosX);
    expect(Math.abs(angleToEarth + Math.PI/2)).toBeLessThan(0.1); // Should be close to -PI/2
    
    // Verify initial rocket angle is pointing straight up (-PI)
    const initialAngle = initialState.rocket.angle;
    expect(Math.abs(initialAngle + Math.PI)).toBeLessThan(0.1); // Should be close to -PI
    
    // Test acceleration
    await page.click('#accelerateBtn');
    await page.waitForTimeout(200); // Short wait to let it accelerate
    
    // Take a screenshot after acceleration
    await page.screenshot({ path: 'tests/rocket-collision.test-results/after-acceleration.png' });
    
    const afterAccelerationState = await getGameState();
    
    // Verify the rocket is no longer landed
    expect(afterAccelerationState.rocket.landed).toBe(false);
    
    // Verify the rocket has moved upward (y coordinate should be smaller since y-axis is inverted)
    expect(afterAccelerationState.rocket.y).toBeLessThan(initialRocketY);
    
    // Now test collision by waiting for the rocket to come back down
    await page.waitForTimeout(3000); // Longer wait to let gravity pull it back
    
    // Take a screenshot after collision
    await page.screenshot({ path: 'tests/rocket-collision.test-results/after-collision.png' });
    
    const afterCollisionState = await getGameState();
    
    // Verify the rocket is landed again
    expect(afterCollisionState.rocket.landed).toBe(true);
    
    // Get new position data
    const newRocketAngle = Math.atan2(
      afterCollisionState.rocket.y - earthPosY,
      afterCollisionState.rocket.x - earthPosX
    );
    
    // Test second acceleration to verify it doesn't glitch through planet
    await page.click('#accelerateBtn');
    await page.waitForTimeout(200); // Short wait
    
    // Take a screenshot after second acceleration
    await page.screenshot({ path: 'tests/rocket-collision.test-results/after-second-acceleration.png' });
    
    const afterSecondAccelerationState = await getGameState();
    
    // Verify the rocket is no longer landed
    expect(afterSecondAccelerationState.rocket.landed).toBe(false);
    
    // Calculate direction of movement
    const moveDirectionX = afterSecondAccelerationState.rocket.x - afterCollisionState.rocket.x;
    const moveDirectionY = afterSecondAccelerationState.rocket.y - afterCollisionState.rocket.y;
    
    // The movement should be approximately in the direction perpendicular to the surface
    // For a point (x,y) on a circle, the perpendicular direction is (x,y) from the center
    const expectedDirectionX = Math.cos(newRocketAngle);
    const expectedDirectionY = Math.sin(newRocketAngle);
    
    // Calculate dot product to check if directions are aligned (should be positive)
    // If the rocket is at the top, it should move upward (negative y)
    if (Math.abs(newRocketAngle + Math.PI/2) < 0.5) { // If at approximately the top
      expect(moveDirectionY).toBeLessThan(0); // Should move upward
    } else {
      const dotProduct = moveDirectionX * expectedDirectionX + moveDirectionY * expectedDirectionY;
      expect(dotProduct).toBeGreaterThan(0); // Directions should be roughly aligned
    }
    
    // Reset again to test straight up orientation at top of planet
    await page.click('#resetBtn');
    await page.waitForTimeout(500);
    
    const finalState = await getGameState();
    
    // Verify the rocket is at the top of the planet with angle of -PI (straight up)
    const finalAngle = finalState.rocket.angle;
    expect(Math.abs(finalAngle + Math.PI)).toBeLessThan(0.1);
    
    // Take a final screenshot
    await page.screenshot({ path: 'tests/rocket-collision.test-results/final-state.png' });
  });
});
