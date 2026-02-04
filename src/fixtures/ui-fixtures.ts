import { test as base } from '@playwright/test';
import { AccessCodePage } from '../pages/access-code-page';
import { DashboardPage } from '../pages/dashboard-page';
import { InvoicesPage } from '../pages/invoices-page';
import { env } from '../utils/env';

// Tipado de fixtures de UI usadas en las pruebas.
type UiFixtures = {
  // Página de acceso con código.
  accessCodePage: AccessCodePage;
  // Página principal/dash del usuario.
  dashboardPage: DashboardPage;
  // Página de facturas.
  invoicesPage: InvoicesPage;
};

// Extiende el test base de Playwright con fixtures de páginas.
export const test = base.extend<UiFixtures>({
  // Crea la página de acceso con código.
  accessCodePage: async ({ page }, use) => {
    await use(new AccessCodePage(page));
  },
  // Crea la página de dashboard.
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  // Crea la página de facturas.
  invoicesPage: async ({ page }, use) => {
    await use(new InvoicesPage(page));
  }
});

// Reexporta expect para facilitar imports desde las pruebas.
export const expect = test.expect;

// Helper para iniciar sesión usando el código de acceso configurado.
export const login = async (accessCodePage: AccessCodePage): Promise<void> => {
  if (!env.webAccessCode) {
    test.skip(true, 'WEB_ACCESS_CODE is not configured for access code login.');
    return;
  }
  const accessCode = env.webAccessCode;
  await accessCodePage.login(accessCode);
};
