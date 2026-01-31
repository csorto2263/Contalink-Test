import { test as base } from '@playwright/test';
import { AccessCodePage } from '../pages/access-code-page';
import { DashboardPage } from '../pages/dashboard-page';
import { env } from '../utils/env';

type UiFixtures = {
  accessCodePage: AccessCodePage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<UiFixtures>({
  accessCodePage: async ({ page }, use) => {
    await use(new AccessCodePage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  }
});

export const expect = test.expect;

export const login = async (accessCodePage: AccessCodePage): Promise<void> => {
  if (!env.webAccessCode) {
    test.skip(true, 'WEB_ACCESS_CODE is not configured for access code login.');
    return;
  }
  const accessCode = env.webAccessCode;
  await accessCodePage.login(accessCode);
};
