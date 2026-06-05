import { Page, Locator } from '@playwright/test';

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
   * Get User Profile button locator from opened dropdown
   */
  getProfileButton(): Locator {
    return this.page.getByRole('button').filter({ hasText: /profil/i });
  }

  /**
   * Click on the profile button in the user menu
   */
  async clickProfileOption() {
    const profileButton = this.getProfileButton();
    await profileButton.waitFor({ state: 'visible' });
    await profileButton.click();
    await this.page.waitForLoadState('networkidle');
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
