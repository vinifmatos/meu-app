import { test, expect } from '@playwright/test';

test.describe('Menu de Navegação', () => {
  test('não deve exibir link "Minha Conta" para usuário não autenticado', async ({ page }) => {
    await page.goto('/');
    
    // O link não deve estar visível
    const linkPerfil = page.locator('text=Minha Conta');
    await expect(linkPerfil).not.toBeVisible();
  });

  test('deve exibir link "Minha Conta" após login', async ({ page }) => {
    // 1. Fazer login
    await page.goto('/login');
    await page.fill('input[id="username"]', 'admin');
    await page.locator('#password input').fill('Password123@');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // 2. Verificar se o link "Minha Conta" apareceu no menu
    const linkPerfil = page.locator('text=Minha Conta');
    await expect(linkPerfil).toBeVisible();

    // 3. Clicar no link e validar redirecionamento
    await linkPerfil.click();
    await expect(page).toHaveURL('/perfil');
    await expect(page.locator('h1')).toHaveText('Minha Conta');
  });
});
