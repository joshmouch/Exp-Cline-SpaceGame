// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Rocket Initial Position Tests', () => {
  test('Rocket should start with nose-up at 12 o\'clock position without falling through Earth', async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:5500');
    
    // Wait for the game to initialize
    await page.waitForSelector('#gameCanvas', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    // Create directory for test results
    await page.evaluate(() => {
      try {
        if (typeof window.fs !== 'undefined' && typeof window.fs.mkdir === 'function') {
          window.fs.mkdir('tests/rocket-initial-position.test-results', { recursive: true });
        }
      } catch (e) {
        console.error('Error creating directory:', e);
      }
    });
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'tests/rocket-initial-position.test-results/initial-position.png' });
    
    // Get the game state
    const initialState = await page.evaluate(() => window.gameState);
    
    // Log initial state for debugging
    console.log('Initial rocket state:', JSON.stringify({
      position: { x: initialState.rocket.x, y: initialState.rocket.y },
      angle: initialState.rocket.angle,
      earthPosition: initialState.rocket.onBody.position,
      earthRadius: initialState.rocket.onBody.radius
    }, null, 2));
    
    // Check initial rocket position - should be at the top of Earth
    const earthPosX = initialState.rocket.onBody.position.x;
    const earthPosY = initialState.rocket.onBody.position.y;
    const earthRadius = initialState.rocket.onBody.radius;
    const initialRocketX = initialState.rocket.x;
    const initialRocketY = initialState.rocket.y;
    
    // Calculate the distance from the Earth's center to the rocket
    const distanceToEarthCenter = Math.sqrt(
      Math.pow(initialRocketX - earthPosX, 2) + 
      Math.pow(initialRocketY - earthPosY, 2)
    );
    
    // The rocket should be positioned at the Earth's radius plus half the rocket height
    expect(Math.abs(distanceToEarthCenter - (earthRadius + 20/2))).toBeLessThan(2);
    
    // Calculate the angle from Earth center to the rocket
    // For 12 o'clock position, the angle should be -PI/2 (top of Earth)
    const angleToEarth = Math.atan2(initialRocketY - earthPosY, initialRocketX - earthPosX);
    expect(Math.abs(angleToEarth + Math.PI/2)).toBeLessThan(0.1);
    
    // Verify initial rocket angle is pointing straight up (-PI)
    const initialAngle = initialState.rocket.angle;
    expect(Math.abs(initialAngle + Math.PI)).toBeLessThan(0.1);
    
    // Wait a bit to make sure the rocket doesn't fall through Earth
    await page.waitForTimeout(1000);
    
    // Take another screenshot to verify the rocket stays in position
    await page.screenshot({ path: 'tests/rocket-initial-position.test-results/after-delay.png' });
    
    // Check position again after the delay
    const afterDelayState = await page.evaluate(() => window.gameState);
    const afterDelayX = afterDelayState.rocket.x;
    const afterDelayY = afterDelayState.rocket.y;
    
    // The rocket should still be at the top of Earth
    const distanceAfterDelay = Math.sqrt(
      Math.pow(afterDelayX - earthPosX, 2) + 
      Math.pow(afterDelayY - earthPosY, 2)
    );
    
    expect(Math.abs(distanceAfterDelay - (earthRadius + 20/2))).toBeLessThan(2);
    
    // The angle from Earth center to the rocket should still be close to -PI/2
    const angleAfterDelay = Math.atan2(afterDelayY - earthPosY, afterDelayX - earthPosX);
    expect(Math.abs(angleAfterDelay + Math.PI/2)).toBeLessThan(0.1);
    
    // The rocket angle should still be pointing straight up
    const angleAfterDelay2 = afterDelayState.rocket.angle;
    expect(Math.abs(angleAfterDelay2 + Math.PI)).toBeLessThan(0.1);
  });
});
