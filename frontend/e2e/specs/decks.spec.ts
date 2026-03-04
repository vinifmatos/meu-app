import { expect, test } from '@playwright/test';

test.describe('Gerenciamento de Decks', () => {
  test.beforeEach(async ({ page }) => {
    // Login inicial
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.fill('input#username', 'admin');
    await page.fill('#password input', 'password123');
    await page.click('button[type="submit"]');

    // Aguarda o login e estabilização
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('deve abrir o diálogo de criação de deck', async ({ page }) => {
    await page.goto('/meus-decks');
    await page.waitForLoadState('networkidle');
    const btnNovo = page.locator('button:has-text("Novo Deck")');
    await expect(btnNovo).toBeVisible({ timeout: 15000 });
    await btnNovo.click();
    await expect(page.locator('.p-dialog-content')).toBeVisible();
    await expect(page.locator('.p-dialog-header')).toContainText('Criar Novo Deck');
  });

  test('deve redirecionar para o editor ao clicar em criar no modal sem enviar para a API', async ({
    page,
  }) => {
    await page.goto('/meus-decks');
    await page.waitForLoadState('networkidle');
    const btnNovo = page.locator('button:has-text("Novo Deck")');
    await expect(btnNovo).toBeVisible({ timeout: 15000 });
    await btnNovo.click();

    const nomeDeck = `Deck Teste Rapido ${Date.now()}`;
    await page.fill('input[placeholder*="Ex:"]', nomeDeck);

    await page.click('button:has-text("Criar Deck")');

    await expect(page).toHaveURL(/\/decks\/novo/, { timeout: 15000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(nomeDeck);
  });
});
