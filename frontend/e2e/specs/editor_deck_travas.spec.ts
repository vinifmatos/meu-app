import { test, expect } from '@playwright/test';

test.describe('Travas do Editor de Deck', () => {
  test.beforeEach(async ({ page }) => {
    // Login inicial
    await page.goto('/login');
    await page.fill('input#username', 'admin');
    await page.fill('#password input', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('deve limitar a 4 cópias no formato Pauper', async ({ page }) => {
    await page.goto('/decks/novo?nome=TestePauper&formato=pauper');

    // Busca uma carta conhecida (Lightning Bolt)
    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    await buscaInput.fill('Lightning Bolt');
    await page.waitForTimeout(1000); // Aguarda debounce

    const btnAdd = page.locator('button .pi-plus').first().locator('..');
    
    // Clica 4 vezes (deve permitir)
    for (let i = 0; i < 4; i++) {
      await expect(btnAdd).not.toBeDisabled();
      await btnAdd.click();
    }

    // No 5º clique, o botão deve estar desabilitado
    await expect(btnAdd).toBeDisabled();
    
    // Verifica na lista do deck se o botão também desabilitou lá
    const btnAddLista = page.locator('.lg\\:col-span-8').locator('button .pi-plus').locator('..');
    await expect(btnAddLista).toBeDisabled();
  });

  test('deve permitir mais de 4 cópias para terrenos básicos', async ({ page }) => {
    await page.goto('/decks/novo?nome=TesteBasicos&formato=pauper');

    // Busca um terreno básico garantido (Plains)
    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    await buscaInput.fill('Plains');
    await page.waitForTimeout(1000); // Aguarda debounce

    // Filtra para garantir que pegamos o Plains correto
    const itemBusca = page.locator('.flex.items-center.justify-between.p-2').filter({ hasText: /Plains/i }).first();
    const btnAdd = itemBusca.locator('button .pi-plus').locator('..');
    
    // Clica 5 vezes (deve continuar habilitado para terrenos básicos)
    for (let i = 0; i < 5; i++) {
      await expect(btnAdd, `Falhou no clique ${i+1}`).not.toBeDisabled();
      await btnAdd.click();
    }
    
    await expect(btnAdd).not.toBeDisabled();
  });

  test('deve limitar a 1 cópia no formato Commander', async ({ page }) => {
    await page.goto('/decks/novo?nome=TesteCommander&formato=commander');

    // Busca uma carta
    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    await buscaInput.fill('Lightning Bolt');
    await page.waitForTimeout(1000); // Aguarda debounce

    const btnAdd = page.locator('button .pi-plus').first().locator('..');
    
    // Primeiro clique (deve permitir)
    await expect(btnAdd).not.toBeDisabled();
    await btnAdd.click();

    // Imediatamente deve desabilitar
    await expect(btnAdd).toBeDisabled();
  });
});
