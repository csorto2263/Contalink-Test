import { expect, Page } from '@playwright/test';

// Page Object para la vista principal del usuario.
export class DashboardPage {
  // Instancia de Playwright Page usada para interactuar con la vista.
  constructor(private readonly page: Page) {}

  // Verifica que el dashboard esté cargado mostrando un encabezado válido.
  async expectLoaded(): Promise<void> {
    const heading = this.page.getByRole('heading', { name: /candidate|dashboard|home|invoices/i });
    await expect(heading).toBeVisible();
  }

  // Abre el menú de usuario si existe un botón visible.
  async openUserMenuIfPresent(): Promise<void> {
    const menuButton = this.page.getByRole('button', { name: /menu|profile|account/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  }

  // Confirma que el indicador de sesión activa sea visible.
  async expectLoggedInIndicator(): Promise<void> {
    const indicator = this.page
      .getByRole('button', { name: /logout|sign out|cerrar sesión/i })
      .or(this.page.getByText(/logout|sign out|cerrar sesión/i));
    await expect(indicator).toBeVisible();
  }
}
