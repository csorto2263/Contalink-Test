import { expect, Locator, Page } from '@playwright/test';

export class InvoicesPage {
  readonly invoiceNumberInput: Locator;
  readonly estadoSelect: Locator;
  readonly fechaInicialInput: Locator;
  readonly fechaFinalInput: Locator;
  readonly mostrarEliminadasCheckbox: Locator;
  readonly buscarButton: Locator;
  readonly limpiarButton: Locator;
  readonly cerrarSesionButton: Locator;
  readonly nuevaFacturaButton: Locator;
  readonly tableRows: Locator;

  constructor(private readonly page: Page) {
    this.invoiceNumberInput = this.page.getByPlaceholder('Ej: FAC-001');
    this.estadoSelect = this.page
      .getByRole('combobox', { name: 'Estado' })
      .or(this.page.locator('select'));
    this.fechaInicialInput = this.page
      .getByLabel('Fecha Inicial')
      .or(this.page.locator('input[placeholder="mm/dd/yyyy"]').first());
    this.fechaFinalInput = this.page
      .getByLabel('Fecha Final')
      .or(this.page.locator('input[placeholder="mm/dd/yyyy"]').nth(1));
    this.mostrarEliminadasCheckbox = this.page
      .getByLabel('Incluir facturas eliminadas')
      .or(this.page.locator('input[type="checkbox"]'));
    this.buscarButton = this.page.getByRole('button', { name: 'Buscar' });
    this.limpiarButton = this.page.getByRole('button', { name: 'Limpiar Filtros' });
    this.cerrarSesionButton = this.page.getByRole('button', { name: 'Cerrar Sesión' });
    this.nuevaFacturaButton = this.page.getByRole('button', { name: 'Nueva Factura' });
    this.tableRows = this.page.locator('table tbody tr');
  }

  async expectLoaded(): Promise<void> {
    const pageTitle = this.page.getByRole('heading', { name: 'Sistema de Facturas' });
    const filtersTitle = this.page.getByText('Filtros de Búsqueda', { exact: true });

    await expect(pageTitle).toBeVisible();
    await expect(filtersTitle).toBeVisible();
    await expect(this.buscarButton).toBeVisible();
    await expect(this.limpiarButton).toBeVisible();
    await expect(this.cerrarSesionButton).toBeVisible();
    await expect(this.nuevaFacturaButton).toBeVisible();
    await expect(this.page.locator('table')).toBeVisible();
  }

  async expectTableColumns(): Promise<void> {
    await expect(this.page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Número de Factura' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Estado' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Acciones' })).toBeVisible();
  }

  async search(): Promise<void> {
    await this.buscarButton.click();
  }

  async clearFilters(): Promise<void> {
    await this.limpiarButton.click();
  }

  async setInvoiceNumber(value: string): Promise<void> {
    await this.invoiceNumberInput.fill(value);
  }

  async setEstado(label: string): Promise<void> {
    await this.estadoSelect.selectOption({ label });
  }

  async setFechaInicial(value: string): Promise<void> {
    await this.fechaInicialInput.fill(value);
  }

  async setFechaFinal(value: string): Promise<void> {
    await this.fechaFinalInput.fill(value);
  }

  async toggleMostrarEliminadas(): Promise<void> {
    await this.mostrarEliminadasCheckbox.click();
  }

  async selectedEstadoLabel(): Promise<string> {
    return this.estadoSelect.locator('option:checked').innerText();
  }

  rowByInvoiceNumber(invoiceNumber: string): Locator {
    return this.tableRows.filter({ has: this.page.getByText(invoiceNumber, { exact: true }) });
  }
}
