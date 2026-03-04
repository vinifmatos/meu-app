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

  test('deve criar um novo deck', async ({ page }) => {
    await page.locator('button:has-text("Novo Deck")').click();
    
    const nomeUnico = `Deck E2E ${Date.now()}`;
    await page.fill('input[placeholder*="Ex:"]', nomeUnico);
    
    const postDeck = page.waitForResponse(r => r.url().includes('/api/v1/decks') && r.request().method() === 'POST');
    
    await page.click('button:has-text("Criar Deck")');
    
    const resposta = await postDeck;
    expect(resposta.status()).toBe(200);
    
    // Recarrega a página para garantir que o dado persistido é lido
    await page.reload();
    
    await expect(page.getByText(nomeUnico)).toBeVisible({ timeout: 15000 });
  });
});
