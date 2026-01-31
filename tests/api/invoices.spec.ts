import { test, expect } from '@playwright/test';
import { ApiClient, buildInvoicePayload } from '../../src/utils/api-client';
import { env } from '../../src/utils/env';


test.describe('Invoices API', () => {
  test.skip(!env.apiAuth, 'API_AUTH is not configured. Copy .env.example to .env and set API_AUTH.');
  let apiClient: ApiClient;
  let invoiceId: string | undefined;

  test.beforeAll(async () => {
    apiClient = new ApiClient();
    await apiClient.init();
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('create invoice', async () => {
    const payload = buildInvoicePayload();
    const response = await apiClient.createInvoice(payload);

    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);

    const body = await response.json();
    invoiceId = body.id || body._id || body.invoiceId;
    expect(invoiceId).toBeTruthy();
  });

  test('get invoice by id', async () => {
    test.skip(!invoiceId, 'Invoice ID missing from create response');
    const response = await apiClient.getInvoice(invoiceId!);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.id || body._id || body.invoiceId).toBe(invoiceId);
  });

  test('patch invoice', async () => {
    test.skip(!invoiceId, 'Invoice ID missing from create response');
    const response = await apiClient.patchInvoice(invoiceId!, { status: 'sent' });
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toMatch(/sent|pending/i);
  });

  test('put invoice', async () => {
    test.skip(!invoiceId, 'Invoice ID missing from create response');
    const payload = buildInvoicePayload({ status: 'paid' });
    const response = await apiClient.updateInvoice(invoiceId!, payload);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toMatch(/paid/i);
  });

  test('delete invoice', async () => {
    test.skip(!invoiceId, 'Invoice ID missing from create response');
    const response = await apiClient.deleteInvoice(invoiceId!);
    expect(response.ok()).toBeTruthy();
  });
});
