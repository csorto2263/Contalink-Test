import { expect, Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    const heading = this.page.getByRole('heading', { name: /candidate|dashboard|home|invoices/i });
    await expect(heading).toBeVisible();
  }

  async openUserMenuIfPresent(): Promise<void> {
    const menuButton = this.page.getByRole('button', { name: /menu|profile|account/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  }

  async expectLoggedInIndicator(): Promise<void> {
    const indicator = this.page.getByRole('button', { name: /logout|sign out/i }).or(
      this.page.getByText(/logout|sign out/i)
    );
    await expect(indicator).toBeVisible();
  }
}
