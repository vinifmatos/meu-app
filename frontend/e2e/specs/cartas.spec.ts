import { test, expect } from '@playwright/test';

test.describe('Listagem de Cartas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cartas');
  });

  test('deve exibir o título da página', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Explorar Cartas', { timeout: 15000 });
  });

  test('deve permitir interagir com o campo de busca', async ({ page }) => {
    const inputBusca = page.locator('input[placeholder*="Buscar"]');
    await expect(inputBusca).toBeVisible({ timeout: 15000 });
    await inputBusca.fill('Test');
    await inputBusca.press('Enter');
  });
});
