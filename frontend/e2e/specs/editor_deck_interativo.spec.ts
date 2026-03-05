import { expect, test } from '@playwright/test';
import { realizarLogin } from '../support/auth';

test.describe('Editor de Deck Interativo', () => {
  test.beforeEach(async ({ page }) => {
    await realizarLogin(page);
  });

  test('deve permitir buscar, visualizar e adicionar cartas com persistência local', async ({
    page,
  }) => {
    // 1. Cria um NOVO deck para o teste
    await page.goto('/meus-decks');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Novo Deck")');

    const nomeDeck = `Deck Interativo ${Date.now()}`;
    await page.fill('input[placeholder*="Ex:"]', nomeDeck);
    await page.click('button:has-text("Criar Deck")');

    // Aguarda carregar o editor do novo deck
    await expect(page).toHaveURL(/\/decks\/novo/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(nomeDeck);

    // 2. Busca por uma carta (ex: "Lightning Bolt")
    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    const responsePromise = page.waitForResponse((r) => r.url().includes('Lightning%20Bolt'));
    await buscaInput.fill('Lightning Bolt');
    await responsePromise;

    // Aguarda resultados
    const resultado = page.locator('span:has-text("Lightning Bolt")').first();
    await expect(resultado).toBeVisible({ timeout: 15000 });

    // 3. Hover para ver imagem ampliada
    await resultado.hover();
    const previewImagem = page.locator('.deck-editor-preview img').first();
    await expect(previewImagem).toBeVisible();

    // 4. Adiciona ao deck
    const itemBusca = page
      .locator('.flex.items-center.justify-between.p-2')
      .filter({ hasText: 'Lightning Bolt' });
    await itemBusca.locator('[data-test-id="btn-adicionar-carta"]').click();

    // 5. Verifica se apareceu na lista do deck (lado direito)
    const itemNoDeck = page.locator('.lg\\:col-span-8').locator('span:has-text("Lightning Bolt")');
    await expect(itemNoDeck).toBeVisible();

    // 6. Recarregar a página e verificar persistência local (localStorage)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Como agora temos um diálogo de confirmação, precisamos aceitar a restauração
    const confirmDialog = page.locator('.p-confirmdialog');
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Sim, Restaurar")');

    await expect(
      page.locator('.lg\\:col-span-8').locator('span:has-text("Lightning Bolt")'),
    ).toBeVisible();

    // 7. Salvar e verificar persistência no backend
    const savePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/v1/decks') && resp.request().method() === 'POST',
    );

    await page.click('button:has-text("Salvar Alterações")');
    const response = await savePromise;
    expect(response.status()).toBe(201);

    // Após salvar, a URL deve mudar para o ID real
    await expect(page).toHaveURL(/\/decks\/\d+/);

    // Limpa para não sujar outros testes
    await page.evaluate(() => localStorage.clear());
  });
});
