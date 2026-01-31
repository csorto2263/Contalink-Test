import { expect, Page } from '@playwright/test';

export class AccessCodePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveURL(/contalink/i);
  }

  async enterAccessCode(code: string): Promise<void> {
    const input = this.page.locator('#access-code');
    await expect(input).toBeVisible();
    await input.fill(code);
  }

  async submitAccessCode(): Promise<void> {
    const button = this.page.getByRole('button', { name: 'Validar Código' });
    await expect(button).toBeVisible();
    await button.click();
  }

  async login(code: string): Promise<void> {
    await this.goto();
    await this.enterAccessCode(code);
    await this.submitAccessCode();
  }
}
