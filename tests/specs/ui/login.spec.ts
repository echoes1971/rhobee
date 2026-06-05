import { test, expect } from '@playwright/test';
import { LoginPage } from './helpers/loginPage';

let loginPage: LoginPage;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  await loginPage.goto();
});

test.describe('Frontend UI - Login', () => {
  test('should successfully login with valid credentials', async ({ page }) => {
    await loginPage.fillUsername('anonymous');
    await loginPage.fillPassword('noPasswordForAnonymous');
    await loginPage.clickLoginButton();

    // Verify successful login using navigation away from login page and token storage
    await expect(page).not.toHaveURL(/.*\/login/);
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('token'))).not.toBeNull();
  });

  test('should display error with invalid credentials', async () => {
    await loginPage.fillUsername('testuser');
    await loginPage.fillPassword('wrongpassword');
    await loginPage.clickLoginButton();

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  test('should show error when fields are empty', async () => {
    await loginPage.clickLoginButton();

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  test('should have username and password input fields', async () => {
    // TODO: Verify login form has required elements
    // Expected behavior: Username and password inputs should be visible
    
    const usernameField = await loginPage.getUsernameField();
    const passwordField = await loginPage.getPasswordField();
    const loginButton = await loginPage.getLoginButton();

    await expect(usernameField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();
  });
});
