import { test, expect } from '@playwright/test';

test.describe('Visibilidade de Decks', () => {
  test('deve listar decks da comunidade na rota pública sem login', async ({ page }) => {
    await page.goto('/decks');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Decks da Comunidade');
  });

  test('deve listar apenas meus decks na rota privada após login', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.fill('input#username', 'admin');
    await page.fill('#password input', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto('/meus-decks');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Meus Decks');
    
    // Verifica se existe o botão de criar (indicando que é a área privada)
    await expect(page.locator('button:has-text("Novo Deck")')).toBeVisible();
  });

  test('deve redirecionar para login ao tentar acessar meus-decks sem autenticação', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/meus-decks');
    await expect(page).toHaveURL(/\/login/);
  });
});
