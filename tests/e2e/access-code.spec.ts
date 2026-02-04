import { test, expect, login } from '../../src/fixtures/ui-fixtures';

// Suite de pruebas para el inicio de sesión con código de acceso.
test.describe('Access code login', () => {
  // Valida que un usuario pueda ingresar y llegar al dashboard.
  test('user can enter access code and reach the app', async ({ accessCodePage, dashboardPage, page }) => {
    await login(accessCodePage);
    await dashboardPage.expectLoggedInIndicator();
    await expect(page).not.toHaveURL(/access/i);
  });

  // Verifica que un código inválido muestre un mensaje de error.
  test('invalid access code shows validation feedback', async ({ accessCodePage, page }) => {
    await accessCodePage.goto();
    await accessCodePage.enterAccessCode('INVALID_CODE');
    await accessCodePage.submitAccessCode();

    const errorMessage = page.getByText(
      'El código de acceso no es válido. Por favor, verifica e intenta nuevamente.',
      { exact: true }
    );
    await expect(errorMessage).toBeVisible();
  });
});
