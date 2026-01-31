import { expect, Page } from '@playwright/test';

export class AccessCodePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveURL(/contalink/i);
  }

  async enterAccessCode(code: string): Promise<void> {
    const input = this.page
      .locator('#access-code')
      .or(this.page.getByRole('textbox', { name: /access code|c[oó]digo de acceso/i }))
      .or(this.page.getByPlaceholder(/access code|c[oó]digo de acceso/i));
    await expect(input).toBeVisible();
    await input.fill(code);
  }

  async submitAccessCode(): Promise<void> {
    const button = this.page
      .getByRole('button', { name: /validar c[oó]digo/i })
      .or(this.page.getByRole('button', { name: /continue|enter|submit|access/i }));
    await expect(button).toBeVisible();
    await button.click();
  }

  async login(code: string): Promise<void> {
    await this.goto();
    await this.enterAccessCode(code);
    await this.submitAccessCode();
  }
}
