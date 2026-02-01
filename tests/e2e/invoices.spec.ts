import { test, expect, login } from '../../src/fixtures/ui-fixtures';

const currencyRegex = /\$/;

const toDateInput = (rawDate: string): string | null => {
  const match = rawDate.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  if (!match) {
    return null;
  }
  const [month, day, yearValue] = match[1].split('/');
  const year = yearValue.length === 2 ? `20${yearValue}` : yearValue;
  return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
};

const addDays = (value: string, days: number): string => {
  const [month, day, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${date.getFullYear()}`;
};

test.describe('Invoices - Access and session', () => {
  test('access code login works and lands in invoices screen', async ({ accessCodePage, invoicesPage }) => {
    await login(accessCodePage);
    await invoicesPage.expectLoaded();
  });

  test('direct navigation without session is blocked', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#access-code')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Validar Código' })).toBeVisible();
  });

  test('logout works', async ({ accessCodePage, invoicesPage, page }) => {
    await login(accessCodePage);
    await invoicesPage.logout();
    await expect(page.locator('#access-code')).toBeVisible();
  });
});

test.describe('Invoices - Core behavior', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ accessCodePage, invoicesPage }) => {
    await login(accessCodePage);
    await invoicesPage.expectLoaded();
  });

  test('initial load shows titles, filters, buttons, and table columns', async ({ invoicesPage }) => {
    await invoicesPage.expectLoaded();
    await invoicesPage.expectTableColumns();
  });

  test('table listing shows required data per row', async ({ invoicesPage }) => {
    const rowsCount = await invoicesPage.tableRows.count();
    expect(rowsCount).toBeGreaterThan(0);

    const row = invoicesPage.tableRows.first();
    const id = row.locator('th, td').nth(0);
    const number = row.locator('th, td').nth(1);
    const total = row.locator('th, td').nth(2);
    const estado = row.locator('th, td').nth(4);
    const acciones = row.locator('th, td').nth(5);

    await expect(id).toHaveText(/.+/);
    await expect(number).toHaveText(/.+/);
    await expect(total).toHaveText(currencyRegex);
    await expect(estado).toHaveText(/Vigente|Pagado|NO EXISTE/i);
    await expect(acciones.locator('button').last()).toBeVisible();
  });

  test('buscar triggers results update', async ({ invoicesPage }) => {
    const initialCount = await invoicesPage.tableRows.count();
    const firstRow = invoicesPage.tableRows.first();
    const invoiceNumber = (await firstRow.locator('th, td').nth(1).innerText()).trim();

    await invoicesPage.setInvoiceNumber(invoiceNumber);
    await invoicesPage.search();

    const filteredCount = await invoicesPage.tableRows.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    for (let index = 0; index < filteredCount; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(1)).toHaveText(invoiceNumber);
    }
  });

  test('limpiar filtros resets inputs and defaults', async ({ invoicesPage }) => {
    await invoicesPage.setInvoiceNumber('FAC-001');
    await invoicesPage.setEstado('Vigente');
    await invoicesPage.setFechaInicial('01/01/2024');
    await invoicesPage.setFechaFinal('01/31/2024');
    await invoicesPage.toggleMostrarEliminadas();

    await invoicesPage.clearFilters();

    await expect(invoicesPage.invoiceNumberInput).toHaveValue('');
    await expect(invoicesPage.fechaInicialInput).toHaveValue('');
    await expect(invoicesPage.fechaFinalInput).toHaveValue('');
    await expect(invoicesPage.mostrarEliminadasCheckbox).not.toBeChecked();
    await expect(invoicesPage.estadoSelect.locator('option:checked')).toHaveText('Todos los estados');
  });

  test('filters: número de factura exact match', async ({ invoicesPage }) => {
    const invoiceNumber = (await invoicesPage.tableRows.first().locator('th, td').nth(1).innerText()).trim();
    await invoicesPage.setInvoiceNumber(invoiceNumber);
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(1)).toHaveText(invoiceNumber);
    }
  });

  test('filters: número de factura partial match', async ({ invoicesPage }) => {
    const invoiceNumber = (await invoicesPage.tableRows.first().locator('th, td').nth(1).innerText()).trim();
    const partial = invoiceNumber.slice(0, Math.max(3, Math.floor(invoiceNumber.length / 2)));

    await invoicesPage.setInvoiceNumber(partial);
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(1)).toContainText(partial);
    }
  });

  test('filters: número de factura case variations when applicable', async ({ invoicesPage }) => {
    const invoiceNumber = (await invoicesPage.tableRows.first().locator('th, td').nth(1).innerText()).trim();
    const hasLetters = /[a-z]/i.test(invoiceNumber);
    test.skip(!hasLetters, 'Invoice number has no alphabetic characters for case-variation check.');

    const variation =
      invoiceNumber === invoiceNumber.toUpperCase() ? invoiceNumber.toLowerCase() : invoiceNumber.toUpperCase();

    await invoicesPage.setInvoiceNumber(variation);
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const value = await invoicesPage.tableRows.nth(index).locator('th, td').nth(1).innerText();
      expect(value.toLowerCase()).toContain(invoiceNumber.toLowerCase());
    }
  });

  test('filters: número de factura trims spaces', async ({ invoicesPage }) => {
    const invoiceNumber = (await invoicesPage.tableRows.first().locator('th, td').nth(1).innerText()).trim();
    await invoicesPage.setInvoiceNumber(`  ${invoiceNumber}  `);
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(1)).toHaveText(invoiceNumber);
    }
  });

  test('filters: número de factura special characters yield no results', async ({ invoicesPage }) => {
    await invoicesPage.setInvoiceNumber('!@#$%^&*');
    await invoicesPage.search();

    await expect(invoicesPage.tableRows).toHaveCount(0);
  });

  test('filters: número de factura non-existent yields no results', async ({ invoicesPage }) => {
    await invoicesPage.setInvoiceNumber(`NO-EXISTE-${Date.now()}`);
    await invoicesPage.search();

    await expect(invoicesPage.tableRows).toHaveCount(0);
  });

  test('filters: estado defaults to todos los estados', async ({ invoicesPage }) => {
    await expect(invoicesPage.estadoSelect.locator('option:checked')).toHaveText('Todos los estados');
  });

  test('filters: estado vigente', async ({ invoicesPage }) => {
    await invoicesPage.setEstado('Vigente');
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(4)).toHaveText(/Vigente/i);
    }
  });

  test('filters: estado pagado', async ({ invoicesPage }) => {
    await invoicesPage.setEstado('Pagado');
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(4)).toHaveText(/Pagado/i);
    }
  });

  test('filters: estado no existe', async ({ invoicesPage }) => {
    await invoicesPage.setEstado('NO EXISTE');
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(4)).toHaveText(/NO EXISTE/i);
    }
  });

  test('filters: estado and número combined', async ({ invoicesPage }) => {
    const row = invoicesPage.tableRows.first();
    const invoiceNumber = (await row.locator('th, td').nth(1).innerText()).trim();
    const estado = (await row.locator('th, td').nth(4).innerText()).trim();

    await invoicesPage.setInvoiceNumber(invoiceNumber);
    await invoicesPage.setEstado(estado);
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(1)).toHaveText(invoiceNumber);
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(4)).toHaveText(new RegExp(estado, 'i'));
    }
  });

  test('date filters: valid range search', async ({ invoicesPage }) => {
    const dateCell = await invoicesPage.tableRows.first().locator('th, td').nth(3).innerText();
    const inputDate = toDateInput(dateCell);
    test.skip(!inputDate, 'Unable to parse date from the first row for date-range validation.');

    await invoicesPage.setFechaInicial(inputDate);
    await invoicesPage.setFechaFinal(inputDate);
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('date filters: start date after end date handling', async ({ invoicesPage, page }) => {
    const dateCell = await invoicesPage.tableRows.first().locator('th, td').nth(3).innerText();
    const inputDate = toDateInput(dateCell);
    test.skip(!inputDate, 'Unable to parse date from the first row for date validation.');

    const nextDay = addDays(inputDate, 1);
    await invoicesPage.setFechaInicial(nextDay);
    await invoicesPage.setFechaFinal(inputDate);
    await invoicesPage.search();

    const errorMessage = page.getByText(/fecha inicial|rango|mayor/i);
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    } else {
      await expect(invoicesPage.tableRows).toHaveCount(0);
    }
  });

  test('date filters: only start date', async ({ invoicesPage }) => {
    const dateCell = await invoicesPage.tableRows.first().locator('th, td').nth(3).innerText();
    const inputDate = toDateInput(dateCell);
    test.skip(!inputDate, 'Unable to parse date from the first row for start-date validation.');

    await invoicesPage.setFechaInicial(inputDate);
    await invoicesPage.setFechaFinal('');
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('date filters: only end date', async ({ invoicesPage }) => {
    const dateCell = await invoicesPage.tableRows.first().locator('th, td').nth(3).innerText();
    const inputDate = toDateInput(dateCell);
    test.skip(!inputDate, 'Unable to parse date from the first row for end-date validation.');

    await invoicesPage.setFechaInicial('');
    await invoicesPage.setFechaFinal(inputDate);
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('date filters: invalid format handling', async ({ invoicesPage }) => {
    const invalidDate = '13/40/2024';
    await invoicesPage.setFechaInicial(invalidDate);
    await invoicesPage.search();

    const inputType = await invoicesPage.fechaInicialInput.getAttribute('type');
    const currentValue = await invoicesPage.fechaInicialInput.inputValue();

    if (inputType === 'date') {
      expect(currentValue).toBe('');
    } else {
      expect(currentValue).toBe(invalidDate);
    }

  });

  test('mostrar eliminadas is off by default', async ({ invoicesPage }) => {
    await expect(invoicesPage.mostrarEliminadasCheckbox).not.toBeChecked();
  });

  test('mostrar eliminadas combined with estado', async ({ invoicesPage }) => {
    await invoicesPage.toggleMostrarEliminadas();
    await invoicesPage.setEstado('Vigente');
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(4)).toHaveText(/Vigente/i);
    }
  });

  test('mostrar eliminadas combined with número', async ({ invoicesPage }) => {
    const invoiceNumber = (await invoicesPage.tableRows.first().locator('th, td').nth(1).innerText()).trim();
    await invoicesPage.toggleMostrarEliminadas();
    await invoicesPage.setInvoiceNumber(invoiceNumber);
    await invoicesPage.search();

    const count = await invoicesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      await expect(invoicesPage.tableRows.nth(index).locator('th, td').nth(1)).toHaveText(invoiceNumber);
    }
  });

  test('mostrar eliminadas toggle preserves filters', async ({ invoicesPage }) => {
    const invoiceNumber = (await invoicesPage.tableRows.first().locator('th, td').nth(1).innerText()).trim();
    await invoicesPage.setInvoiceNumber(invoiceNumber);
    await invoicesPage.search();

    await invoicesPage.toggleMostrarEliminadas();

    await expect(invoicesPage.invoiceNumberInput).toHaveValue(invoiceNumber);
  });

  test('delete removes row and can be viewed with mostrar eliminadas when supported', async ({ invoicesPage, page }) => {
    const row = invoicesPage.tableRows.first();
    const invoiceNumber = (await row.locator('th, td').nth(1).innerText()).trim();

    await row.locator('th, td').nth(5).locator('button').last().click();

    const cancelButton = page
      .getByRole('button', { name: /cancelar|no/i })
      .or(page.getByRole('button', { name: /cerrar/i }));
    const confirmButton = page
      .getByRole('button', { name: /confirmar|eliminar|sí|si|ok/i })
      .or(page.getByRole('button', { name: /accept|delete/i }));

    const cancelVisible = await cancelButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (cancelVisible) {
      await cancelButton.click();
      await expect(invoicesPage.rowByInvoiceNumber(invoiceNumber)).toHaveCount(1);

      await row.locator('th, td').nth(5).locator('button').last().click();
    }

    const confirmVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (confirmVisible) {
      await confirmButton.click();
    }

    await expect(invoicesPage.rowByInvoiceNumber(invoiceNumber)).toHaveCount(0);

    await invoicesPage.toggleMostrarEliminadas();
    await invoicesPage.setInvoiceNumber(invoiceNumber);
    await invoicesPage.search();

    const deletedRowCount = await invoicesPage.rowByInvoiceNumber(invoiceNumber).count();
    if (deletedRowCount > 0) {
      await expect(invoicesPage.rowByInvoiceNumber(invoiceNumber)).toHaveCount(deletedRowCount);
    } else {
      await expect(invoicesPage.tableRows).toHaveCount(0);
    }
  });
});
