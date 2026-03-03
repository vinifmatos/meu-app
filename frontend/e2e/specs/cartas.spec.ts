import { test, expect } from '@playwright/test';

test.describe('Listagem de Cartas', () => {
  test('deve carregar a listagem de cartas e exibir itens', async ({ page }) => {
    // Acessa a rota das cartas
    await page.goto('/cartas');
    
    // Verifica se o título da listagem está presente
    await expect(page.locator('h2')).toContainText('Listagem de Cartas');
    
    // Verifica se o DataView foi carregado
    const dataview = page.locator('p-dataView');
    await expect(dataview).toBeVisible();

    // Espera que ao menos um item de carta seja exibido (se houver dados no banco)
    // Se não houver dados, o template 'empty' deve ser exibido.
    const itens = page.locator('.grid > div');
    const vazio = page.locator('text=Nenhuma carta encontrada');
    
    await expect(itens.first().or(vazio)).toBeVisible();
  });

  test('deve filtrar cartas pelo nome ao pressionar enter', async ({ page }) => {
    await page.goto('/cartas');
    
    const inputBusca = page.locator('input[placeholder="Buscar por nome..."]');
    await inputBusca.fill('Lightning');
    await inputBusca.press('Enter');
    
    // O Playwright espera a resposta da rede ou mudanças no DOM
    // Aqui poderíamos validar se os itens exibidos contêm o termo de busca.
    await expect(page).toHaveURL(/.*filters%5Bname%5D=Lightning/);
  });
});
