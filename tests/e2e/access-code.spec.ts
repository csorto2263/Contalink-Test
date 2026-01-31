import { test, expect, login } from '../../src/fixtures/ui-fixtures';

test.describe('Access code login', () => {
  test('user can enter access code and reach the app', async ({ accessCodePage, dashboardPage, page }) => {
    await login(accessCodePage);
    await dashboardPage.expectLoggedInIndicator();
    await expect(page).not.toHaveURL(/access/i);
  });

  test('invalid access code shows validation feedback', async ({ accessCodePage, page }) => {
    await accessCodePage.goto();
    await accessCodePage.enterAccessCode('INVALID_CODE');
    await accessCodePage.submitAccessCode();

    const errorMessage = page.getByText(/invalid|error|access code|no es v[aá]lido|c[oó]digo de acceso/i);
    await expect(errorMessage).toBeVisible();
  });
});
