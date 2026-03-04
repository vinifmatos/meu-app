import { expect, test } from '@playwright/test';

test.describe('Travas do Editor de Deck', () => {
  test.beforeEach(async ({ page }) => {
    // Garante um estado limpo antes do login
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());

    // Login inicial
    await page.fill('input#username', 'admin');
    await page.fill('#password input', 'password123');
    await page.click('button[type="submit"]');

    // Aguarda o login e estabilização
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('deve limitar a 4 cópias no formato Pauper', async ({ page }) => {
    const nomeUnico = `TravaPauper_${Date.now()}`;
    await page.goto(`/decks/novo?nome=${nomeUnico}&formato=pauper`);
    await page.waitForLoadState('networkidle');

    // Busca por uma carta comum (Pauper legal)
    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    const responsePromise = page.waitForResponse((r) => r.url().includes('Lightning%20Bolt'));
    await buscaInput.fill('Lightning Bolt');
    await responsePromise;

    // Localiza o botão de adicionar
    const btnAdd = page
      .locator('.flex.items-center.justify-between.p-2')
      .filter({ hasText: 'Lightning Bolt' })
      .getByTestId('btn-adicionar-carta')
      .getByRole('button');

    await expect(btnAdd).toBeVisible({ timeout: 15000 });

    // Clica 4 vezes para adicionar
    for (let i = 0; i < 4; i++) {
      await btnAdd.click();
    }

    // O 5º clique deve estar desabilitado
    await expect(btnAdd).toBeDisabled();

    // Verifica na lista do deck se tem quantidade 4
    const qtdNoDeck = page
      .locator('.lg\\:col-span-8')
      .locator('span.font-mono.font-bold')
      .filter({ hasText: '4' });
    await expect(qtdNoDeck).toBeVisible();
  });

  test('deve permitir mais de 4 cópias para terrenos básicos', async ({ page }) => {
    const nomeUnico = `TravaTerrenos_${Date.now()}`;
    await page.goto(`/decks/novo?nome=${nomeUnico}&formato=pauper`);
    await page.waitForLoadState('networkidle');

    // Busca por um terreno básico
    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    const responsePromise = page.waitForResponse((r) => r.url().includes('Mountain'));
    await buscaInput.fill('Mountain');
    await responsePromise;

    const btnAdd = page
      .locator('.flex.items-center.justify-between.p-2')
      .filter({ hasText: 'Mountain' })
      .getByTestId('btn-adicionar-carta')
      .getByRole('button');

    await expect(btnAdd).toBeVisible({ timeout: 15000 });

    // Clica 5 vezes (deve continuar habilitado)
    for (let i = 0; i < 5; i++) {
      await btnAdd.click();
      await expect(btnAdd).toBeEnabled();
    }

    // Verifica na lista do deck se tem quantidade 5
    const qtdNoDeck = page
      .locator('.lg\\:col-span-8')
      .locator('span.font-mono.font-bold')
      .filter({ hasText: '5' });
    await expect(qtdNoDeck).toBeVisible();
  });

  test('deve limitar a 1 cópia no formato Commander', async ({ page }) => {
    const nomeUnico = `TravaCmd_${Date.now()}`;
    await page.goto(`/decks/novo?nome=${nomeUnico}&formato=commander`);
    await page.waitForLoadState('networkidle');

    // Busca por uma carta qualquer
    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    const responsePromise = page.waitForResponse((r) => r.url().includes('Lightning%20Bolt'));
    await buscaInput.fill('Lightning Bolt');
    await responsePromise;

    const btnAdd = page
      .locator('.flex.items-center.justify-between.p-2')
      .filter({ hasText: 'Lightning Bolt' })
      .getByTestId('btn-adicionar-carta')
      .getByRole('button');

    await expect(btnAdd).toBeVisible({ timeout: 15000 });

    // Clica 1 vez para adicionar
    await btnAdd.click();

    // O 2º clique deve estar desabilitado
    await expect(btnAdd).toBeDisabled();
  });
});
