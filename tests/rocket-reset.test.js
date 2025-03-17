// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Rocket Reset Tests', () => {
  test('Initial position should be the same after reset as after page load', async ({ page }) => {
    // Create directory for test results
    await page.evaluate(() => {
      try {
        if (typeof window.fs !== 'undefined' && typeof window.fs.mkdir === 'function') {
          window.fs.mkdir('tests/rocket-reset.test-results', { recursive: true });
        }
      } catch (e) {
        console.error('Error creating directory:', e);
      }
    });
    
    // Navigate to the game
    await page.goto('http://localhost:5500');
    
    // Wait for the game to initialize
    await page.waitForSelector('#gameCanvas', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'tests/rocket-reset.test-results/initial-state.png' });
    
    // Get initial position data
    const initialState = await page.evaluate(() => {
      return {
        rocket: {
          x: window.gameState.rocket.x,
          y: window.gameState.rocket.y,
          angle: window.gameState.rocket.angle
        },
        earth: {
          x: window.gameState.rocket.onBody.position.x,
          y: window.gameState.rocket.onBody.position.y
        }
      };
    });
    
    console.log('Initial state:', JSON.stringify(initialState, null, 2));
    
    // Now let's accelerate and move the rocket
    await page.click('#accelerateBtn');
    await page.waitForTimeout(1000);
    
    // Take a screenshot after movement
    await page.screenshot({ path: 'tests/rocket-reset.test-results/after-movement.png' });
    
    // Now reset the game
    await page.click('#resetBtn');
    await page.waitForTimeout(1000);
    
    // Take a screenshot after reset
    await page.screenshot({ path: 'tests/rocket-reset.test-results/after-reset.png' });
    
    // Get post-reset position data
    const afterResetState = await page.evaluate(() => {
      return {
        rocket: {
          x: window.gameState.rocket.x,
          y: window.gameState.rocket.y,
          angle: window.gameState.rocket.angle
        },
        earth: {
          x: window.gameState.rocket.onBody.position.x,
          y: window.gameState.rocket.onBody.position.y
        }
      };
    });
    
    console.log('After reset state:', JSON.stringify(afterResetState, null, 2));
    
    // Reload the page to get a fresh start
    await page.reload();
    await page.waitForSelector('#gameCanvas', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    // Take a screenshot after reload
    await page.screenshot({ path: 'tests/rocket-reset.test-results/after-reload.png' });
    
    // Get post-reload position data
    const afterReloadState = await page.evaluate(() => {
      return {
        rocket: {
          x: window.gameState.rocket.x,
          y: window.gameState.rocket.y,
          angle: window.gameState.rocket.angle
        },
        earth: {
          x: window.gameState.rocket.onBody.position.x,
          y: window.gameState.rocket.onBody.position.y
        }
      };
    });
    
    console.log('After reload state:', JSON.stringify(afterReloadState, null, 2));
    
    // Test that reset and reload positions are the same
    expect(Math.abs(afterResetState.rocket.x - afterReloadState.rocket.x)).toBeLessThan(2);
    expect(Math.abs(afterResetState.rocket.y - afterReloadState.rocket.y)).toBeLessThan(2);
    expect(Math.abs(afterResetState.rocket.angle - afterReloadState.rocket.angle)).toBeLessThan(0.1);
  });
});
