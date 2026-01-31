import { APIRequestContext, request } from '@playwright/test';
import { env, requireEnv } from './env';

export type InvoicePayload = {
  customerName: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid';
  dueDate: string;
};

export class ApiClient {
  private context: APIRequestContext | null = null;

  async init(): Promise<void> {
    const baseURL = requireEnv('apiBaseUrl');
    const auth = requireEnv('apiAuth');
    this.context = await request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Authorization: auth
      }
    });
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }

  async createInvoice(payload: InvoicePayload) {
    return this.getContext().post('/v1/invoices', { data: payload });
  }

  async getInvoice(id: string) {
    return this.getContext().get(`/v1/invoices/${id}`);
  }

  async updateInvoice(id: string, payload: InvoicePayload) {
    return this.getContext().put(`/v1/invoices/${id}`, { data: payload });
  }

  async patchInvoice(id: string, payload: Partial<InvoicePayload>) {
    return this.getContext().patch(`/v1/invoices/${id}`, { data: payload });
  }

  async deleteInvoice(id: string) {
    return this.getContext().delete(`/v1/invoices/${id}`);
  }

  private getContext(): APIRequestContext {
    if (!this.context) {
      throw new Error('API context not initialized. Call init() before making requests.');
    }
    return this.context;
  }
}

export const buildInvoicePayload = (overrides: Partial<InvoicePayload> = {}): InvoicePayload => {
  const today = new Date();
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    customerName: `QA Customer ${Date.now()}`,
    description: 'Automation invoice for testing',
    amount: 1250,
    currency: 'USD',
    status: 'draft',
    dueDate,
    ...overrides
  };
};
