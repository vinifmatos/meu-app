import { expect, test } from '@playwright/test';
import { realizarLogin } from '../support/auth';

test.describe('Gerenciamento de Decks', () => {
  test.beforeEach(async ({ page }) => {
    await realizarLogin(page);
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
