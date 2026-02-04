import { expect, Locator, Page } from '@playwright/test';

// Page Object para la pantalla de facturas.
export class InvoicesPage {
  // Input para filtrar por número de factura.
  readonly invoiceNumberInput: Locator;
  // Selector de estado de factura.
  readonly estadoSelect: Locator;
  // Input para fecha inicial del filtro.
  readonly fechaInicialInput: Locator;
  // Input para fecha final del filtro.
  readonly fechaFinalInput: Locator;
  // Checkbox para incluir facturas eliminadas.
  readonly mostrarEliminadasCheckbox: Locator;
  // Botón para ejecutar la búsqueda.
  readonly buscarButton: Locator;
  // Botón para limpiar filtros.
  readonly limpiarButton: Locator;
  // Botón para cerrar sesión.
  readonly cerrarSesionButton: Locator;
  // Botón para crear una nueva factura.
  readonly nuevaFacturaButton: Locator;
  // Filas de la tabla de resultados.
  readonly tableRows: Locator;

  // Configura los selectores base de la página.
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

  // Verifica que la página principal de facturas esté visible.
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

  // Valida que la tabla tenga las columnas esperadas.
  async expectTableColumns(): Promise<void> {
    await expect(this.page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Número de Factura' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Total' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Estado' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Acciones' })).toBeVisible();
  }

  // Ejecuta la búsqueda con los filtros actuales.
  async search(): Promise<void> {
    await this.buscarButton.click();
    await this.page.waitForTimeout(3000);
  }

  // Limpia los filtros y espera a que la tabla se actualice.
  async clearFilters(): Promise<void> {
    await this.limpiarButton.click();
    await this.page.waitForTimeout(3000);
  }

  // Cierra la sesión aceptando el diálogo de confirmación si aparece.
  async logout(): Promise<void> {
    const dialogPromise = this.page.waitForEvent('dialog').then(async (dialog) => {
      await dialog.accept();
    });
    await this.cerrarSesionButton.click();
    await Promise.race([dialogPromise, this.page.waitForTimeout(1000)]);
  }

  // Define el número de factura para el filtro.
  async setInvoiceNumber(value: string): Promise<void> {
    await this.invoiceNumberInput.fill(value);
  }

  // Define el estado de factura por etiqueta visible.
  async setEstado(label: string): Promise<void> {
    await this.estadoSelect.selectOption({ label });
  }

  // Define la fecha inicial, normalizando formato si es necesario.
  async setFechaInicial(value: string): Promise<void> {
    const formattedValue = await this.normalizeDateForInput(this.fechaInicialInput, value);
    await this.fechaInicialInput.fill(formattedValue);
  }

  // Define la fecha final, normalizando formato si es necesario.
  async setFechaFinal(value: string): Promise<void> {
    const formattedValue = await this.normalizeDateForInput(this.fechaFinalInput, value);
    await this.fechaFinalInput.fill(formattedValue);
  }

  // Alterna el checkbox de mostrar eliminadas.
  async toggleMostrarEliminadas(): Promise<void> {
    await this.mostrarEliminadasCheckbox.click();
  }

  // Obtiene el texto visible del estado seleccionado.
  async selectedEstadoLabel(): Promise<string> {
    return this.estadoSelect.locator('option:checked').innerText();
  }

  // Filtra la tabla por un número de factura exacto.
  rowByInvoiceNumber(invoiceNumber: string): Locator {
    return this.tableRows.filter({ has: this.page.getByText(invoiceNumber, { exact: true }) });
  }

  // Convierte fecha mm/dd/yyyy a formato para input tipo date (yyyy-mm-dd).
  private async normalizeDateForInput(input: Locator, value: string): Promise<string> {
    if (!value) {
      return value;
    }
    const inputType = await input.getAttribute('type');
    if (inputType !== 'date') {
      return value;
    }

    const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!slashMatch) {
      return value;
    }

    const [, month, day, yearValue] = slashMatch;
    const year = yearValue.length === 2 ? `20${yearValue}` : yearValue;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}
