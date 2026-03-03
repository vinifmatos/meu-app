import { test, expect } from '@playwright/test';

test.describe('Página Inicial', () => {
  test('deve carregar a página de início com sucesso', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se existe algum elemento que identifique a página inicial.
    // Como a página de início atual é simples, vamos verificar o título se houver ou um seletor app-inicio.
    await expect(page.locator('app-inicio')).toBeVisible();
  });
});
