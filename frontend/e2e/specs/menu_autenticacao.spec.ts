import { test, expect } from '@playwright/test';

test.describe('Visibilidade do Menu por Autenticação', () => {
  test('não deve exibir "Meus Decks" para usuário não autenticado', async ({ page }) => {
    await page.goto('/');
    
    // O item "Meus Decks" não deve ser visível no menu lateral
    const menuMeusDecks = page.locator('.p-menuitem-link:has-text("Meus Decks")');
    await expect(menuMeusDecks).not.toBeVisible();
  });

  test('deve exibir "Meus Decks" após o login', async ({ page }) => {
    // 1. Faz login
    await page.goto('/login');
    await page.fill('input#username', 'admin');
    await page.fill('#password input', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).not.toHaveURL(/\/login/);
    
    // 2. Verifica se o menu agora tem "Meus Decks"
    const menuMeusDecks = page.getByText('Meus Decks', { exact: true });
    await expect(menuMeusDecks).toBeVisible({ timeout: 10000 });
    
    // 3. Clica no item e verifica se navegou corretamente
    await menuMeusDecks.click();
    await expect(page).toHaveURL(/\/meus-decks/);
    await expect(page.getByRole('heading', { name: 'Meus Decks' })).toBeVisible();
  });

  test('deve remover "Meus Decks" do menu após o logout', async ({ page }) => {
    // 1. Faz login
    await page.goto('/login');
    await page.fill('input#username', 'admin');
    await page.fill('#password input', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/login/);

    // 2. Localiza e clica no botão de Logout (ícone pi-sign-out)
    const btnLogout = page.locator('.pi-sign-out').locator('..');
    await btnLogout.click();
    
    await expect(page).toHaveURL('/');

    // 3. Verifica se o item "Meus Decks" sumiu
    const menuMeusDecks = page.getByText('Meus Decks', { exact: true });
    await expect(menuMeusDecks).not.toBeVisible();
  });
});
