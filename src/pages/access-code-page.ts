import { expect, Page } from '@playwright/test';

// Page Object para la pantalla de acceso por código.
export class AccessCodePage {
  // Instancia de Playwright Page usada para interactuar con la vista.
  constructor(private readonly page: Page) {}

  // Navega a la URL base y valida que sea el sitio correcto.
  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page).toHaveURL(/contalink/i);
  }

  // Completa el input con el código de acceso.
  async enterAccessCode(code: string): Promise<void> {
    const input = this.page.locator('#access-code');
    await expect(input).toBeVisible();
    await input.fill(code);
  }

  // Envía el formulario de acceso.
  async submitAccessCode(): Promise<void> {
    const button = this.page.getByRole('button', { name: 'Validar Código' });
    await expect(button).toBeVisible();
    await button.click();
  }

  // Flujo completo de login con el código de acceso.
  async login(code: string): Promise<void> {
    await this.goto();
    await this.enterAccessCode(code);
    await this.submitAccessCode();
  }
}
