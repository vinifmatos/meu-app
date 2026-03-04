import { test, expect } from '@playwright/test';

test.describe('Editor de Deck Interativo', () => {
  test.beforeEach(async ({ page }) => {
    // Login inicial
    await page.goto('/login');
    await page.fill('input#username', 'admin');
    await page.fill('#password input', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('deve permitir buscar, visualizar e adicionar cartas com persistência local', async ({ page }) => {
    // 1. Cria um NOVO deck para o teste
    await page.goto('/meus-decks');
    await page.click('button:has-text("Novo Deck")');
    
    const nomeDeck = `Deck Teste TDD ${Date.now()}`;
    await page.fill('input[placeholder*="Ex:"]', nomeDeck);
    await page.click('button:has-text("Criar Deck")');
    
    // Aguarda carregar o editor do novo deck
    await expect(page).toHaveURL(/\/decks\/novo/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(nomeDeck);

    // 2. Busca por uma carta (ex: "Lightning Bolt")
    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    await buscaInput.fill('Lightning Bolt');
    await buscaInput.press('Enter');
    
    // Aguarda resultados (pode demorar dependendo da API/Scryfall)
    const resultado = page.locator('span:has-text("Lightning Bolt")').first();
    await expect(resultado).toBeVisible({ timeout: 15000 });

    // 3. Hover para ver imagem ampliada (DEVE FALHAR INICIALMENTE)
    await resultado.hover();
    const previewImagem = page.locator('.p-overlaypanel img, .deck-editor-preview img').first();
    await expect(previewImagem).toBeVisible();

    // 4. Adiciona ao deck
    const itemBusca = page.locator('.flex.items-center.justify-between.p-2').filter({ hasText: 'Lightning Bolt' });
    await itemBusca.locator('button').last().click();

    // 5. Verifica se apareceu na lista do deck (lado direito)
    const itemNoDeck = page.locator('.lg\\:col-span-8').locator('span:has-text("Lightning Bolt")');
    await expect(itemNoDeck).toBeVisible();

    // 6. Recarregar a página e verificar persistência local (localStorage)
    await page.reload();
    await expect(page.locator('.lg\\:col-span-8').locator('span:has-text("Lightning Bolt")')).toBeVisible();

    // 7. Salvar e verificar persistência no backend
    // Ao salvar um deck "novo", ele cria o deck no backend
    const savePromise = page.waitForResponse(resp => 
      resp.url().includes('/api/v1/decks') && resp.request().method() === 'POST'
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
