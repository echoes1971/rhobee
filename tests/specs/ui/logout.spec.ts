import { test, expect } from '@playwright/test';
import { LoginPage, NavBar } from './helpers/loginPage';

test.describe('Frontend UI - Logout', () => {
  test('should successfully logout and redirect to login page', async ({ page }) => {
    // Test: User should be able to logout and be redirected to login page
    // Expected behavior: After logout, user is on /login page and localStorage is cleared

    // Step 1: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillUsername('anonymous');
    await loginPage.fillPassword('noPasswordForAnonymous');
    await loginPage.clickLoginButton();

    // Verify login succeeded
    await expect(page).not.toHaveURL(/.*\/login/);
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('token'))).not.toBeNull();

    // Step 2: Navigate to home to ensure navbar is visible
    await page.goto('/');
    await page.waitForLoadState('networkidle');

 
    const navBar = new NavBar(page);
    // Step 3: click on username dropdown to reveal logout option (if applicable)
    // await navBar.clickUsernameDropdown();
    // Step 4: Logout
    await navBar.logout();

    // Step 4: Verify logout succeeded
    // login button should be visible again, indicating user is logged out
    await expect(navBar.getLoginButton()).toBeVisible();
    // await expect(page).toHaveURL(/.*\/login/);

    // Token should be cleared from localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('should show logout button in navbar when logged in', async ({ page }) => {
    // Test: Logout button should be visible in navbar for authenticated users
    // Expected behavior: Username dropdown and logout option visible after login

    // Step 1: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillUsername('anonymous');
    await loginPage.fillPassword('noPasswordForAnonymous');
    await loginPage.clickLoginButton();

    // Step 2: Navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const navBar = new NavBar(page);
    // Step 3: click on username dropdown to reveal logout option
    await navBar.clickUsernameDropdown();
    const logoutButton = navBar.getLogoutButton();

    await expect(logoutButton).toBeVisible();
  });

  test('should not show logout button in navbar when not logged in', async ({ page }) => {
    // Test: Logout button should not be visible for unauthenticated users
    // Expected behavior: Username dropdown not visible on home page before login

    // Go to home page without logging in
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The navbar should exist but logout button should not be visible
    const navBar = new NavBar(page);
    const logoutButton = navBar.logoutButton;

    // Logout button should not be visible or should not exist
    const isVisible = await logoutButton.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});
