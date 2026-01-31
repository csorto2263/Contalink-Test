import { test, expect, login } from '../../src/fixtures/ui-fixtures';

test.describe('Smoke coverage', () => {
  test('main layout and critical sections are visible', async ({ accessCodePage, dashboardPage, page }) => {
    await login(accessCodePage);
    await dashboardPage.expectLoaded();

    const navigation = page.getByRole('navigation');
    const main = page.getByRole('main');
    await expect(navigation.or(main)).toBeVisible();
  });
});
