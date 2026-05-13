import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    this.page = page;
    // TODO: Update selectors based on actual UI elements
    this.usernameInput = page.locator('input[placeholder="Login"]');
    this.passwordInput = page.locator('input[placeholder="Password"]');
    this.loginButton = page.locator('button:has-text("Login")');
    this.errorMessage = page.locator('.alert-danger');
    this.usernameError = page.locator('.invalid-feedback');
    this.passwordError = page.locator('.invalid-feedback');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Fill username field
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Click login button
   */
  async clickLoginButton() {
    await this.loginButton.click();
    // TODO: Add appropriate wait condition (network idle, navigation, etc.)
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }

  /**
   * Get username field error message
   */
  async getUsernameError(): Promise<string | null> {
    return await this.usernameError.textContent();
  }

  /**
   * Get password field error message
   */
  async getPasswordError(): Promise<string | null> {
    return await this.passwordError.textContent();
  }

  /**
   * Get username input field locator
   */
  async getUsernameField(): Promise<Locator> {
    return this.usernameInput;
  }

  /**
   * Get password input field locator
   */
  async getPasswordField(): Promise<Locator> {
    return this.passwordInput;
  }

  /**
   * Get login button locator
   */
  async getLoginButton(): Promise<Locator> {
    return this.loginButton;
  }
}

export class NavBar {
  readonly page: Page;
  readonly usernameDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    // Username dropdown (shows when logged in)
    this.usernameDropdown = page.locator('[id="basic-nav-dropdown"]');
  }

  /**
   * Click on the username dropdown to open logout menu
   */
  async clickUsernameDropdown() {
    await this.usernameDropdown.click();
    await this.page.waitForLoadState('networkidle');
  }

  getLoginButton(): Locator {
    return this.page.getByRole('button').filter({ hasText: /login/i });
  }

  /**
   * Get logout button locator from opened dropdown
   */
  getLogoutButton(): Locator {
    return this.page.getByRole('button').filter({ hasText: /logout/i });
    // return this.page.getByRole('menuitem').filter({ hasText: /logout/i });
  }

  /**
   * Click logout button and wait for redirect to login
   */
  async clickLogout() {
    const logoutButton = this.getLogoutButton();
    await logoutButton.waitFor({ state: 'visible' });
    await logoutButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform logout flow (click dropdown, then logout)
   */
  async logout() {
    await this.clickUsernameDropdown();
    await this.clickLogout();
  }
}
