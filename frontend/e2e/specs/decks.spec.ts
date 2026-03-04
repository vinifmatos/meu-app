import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Decks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/decks');
  });

  test('deve abrir o diálogo de criação de deck', async ({ page }) => {
    const btnNovo = page.locator('button:has-text("Novo Deck")');
    await expect(btnNovo).toBeVisible({ timeout: 15000 });
    await btnNovo.click();
    
    await expect(page.locator('h2:has-text("Criar Novo Deck")')).toBeVisible();
  });

  test('deve redirecionar para o editor ao clicar em criar no modal sem enviar para a API', async ({ page }) => {
    // Escuta por qualquer chamada POST de criação de deck
    const chamadasPost = [];
    page.on('request', request => {
      if (request.url().includes('/api/v1/decks') && request.method() === 'POST') {
        chamadasPost.push(request);
      }
    });

    await page.locator('button:has-text("Novo Deck")').click();
    
    const nomeUnico = `Deck E2E ${Date.now()}`;
    await page.fill('input[placeholder*="Ex:"]', nomeUnico);
    
    // Clicar no botão que antes criava, agora deve apenas redirecionar
    await page.click('button:has-text("Criar Deck")');
    
    // Deve estar na URL de edição com o parâmetro "novo"
    await expect(page).toHaveURL(/\/decks\/novo/);
    
    // Não deve ter havido chamada POST para a API de decks ainda
    expect(chamadasPost.length).toBe(0);
    
    // O título no editor deve conter o nome que passamos
    await expect(page.getByRole('heading', { level: 1 })).toContainText(nomeUnico);
    
    // Deve haver um botão "Salvar Deck" no editor para esta situação
    const btnSalvar = page.locator('button:has-text("Salvar Deck")');
    await expect(btnSalvar).toBeVisible();

    // Agora sim, ao clicar em salvar, deve chamar a API
    const responsePromise = page.waitForResponse(r => 
      r.url().includes('/api/v1/decks') && r.request().method() === 'POST'
    );
    
    await btnSalvar.click();
    
    const response = await responsePromise;
    expect([200, 201]).toContain(response.status());
    
    // Após salvar, o ID deve mudar para o ID real retornado
    await expect(page).toHaveURL(/\/decks\/\d+/);
    await expect(btnSalvar).not.toBeVisible();
  });
});
