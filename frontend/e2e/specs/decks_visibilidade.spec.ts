import { expect, test } from '@playwright/test';

test.describe('Visibilidade de Decks', () => {
  test('deve listar decks da comunidade na rota pública sem login', async ({ page }) => {
    await page.goto('/decks');
    await expect(page.getByRole('heading', { name: 'Decks da Comunidade' })).toBeVisible();

    // Na rota pública não deve ter o botão "Novo Deck"
    const btnNovo = page.locator('button:has-text("Novo Deck")');
    await expect(btnNovo).not.toBeVisible();
  });

  test('deve listar apenas meus decks na rota privada após login', async ({ page }) => {
    // 1. Faz login
    await page.goto('/login');
    await page.fill('input#username', 'admin');
    await page.fill('#password input', 'password123');

    const btnSubmit = page.locator('button[type="submit"]');
    await expect(btnSubmit).toBeEnabled();
    await btnSubmit.click();

    await expect(page).not.toHaveURL(/\/login/);

    // 2. Vai para meus decks
    await page.goto('/meus-decks');
    await expect(page.getByRole('heading', { name: 'Meus Decks' })).toBeVisible();

    // Na rota privada deve ter o botão "Novo Deck"
    const btnNovo = page.locator('button:has-text("Novo Deck")');
    await expect(btnNovo).toBeVisible();
  });

  test('deve redirecionar para login ao tentar acessar meus-decks sem autenticação', async ({
    page,
  }) => {
    await page.goto('/meus-decks');
    // Deve ser redirecionado para o login com returnUrl
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fmeus-decks/);
  });
});
