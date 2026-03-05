import { expect, test } from '@playwright/test';
import { realizarLogin } from '../support/auth';

test.describe('Filtros de Pesquisa no Editor', () => {
  test.beforeEach(async ({ page }) => {
    await realizarLogin(page);
  });

  test('deve filtrar cartas por tipo', async ({ page }) => {
    const nomeUnico = `FiltroTipo_${Date.now()}`;
    await page.goto(`/decks/novo?nome=${nomeUnico}&formato=pauper`);
    await page.waitForLoadState('networkidle');

    const filtroTipo = page.locator('input[placeholder*="Tipo"]');
    await expect(filtroTipo).toBeVisible({ timeout: 15000 });

    const responsePromise = page.waitForResponse(
      (r) =>
        r.url().includes('/api/v1/cartas') && r.url().includes('filters%5Btype_line%5D=Creature'),
    );
    await filtroTipo.fill('Creature');

    const response = await responsePromise;
    const json = await response.json();
    expect(json.data.cartas.every((c: any) => c.typeLine.toLowerCase().includes('creature'))).toBe(
      true,
    );
  });

  test('deve filtrar cartas por cores selecionadas', async ({ page }) => {
    const nomeUnico = `FiltroCores_${Date.now()}`;
    await page.goto(`/decks/novo?nome=${nomeUnico}&formato=pauper`);
    await page.waitForLoadState('networkidle');

    // Seleciona as cores Red (R) e Blue (U)
    const btnRed = page.locator('[data-test-id="filtro-cores"]').getByText('{R}', { exact: true });
    const btnBlue = page.locator('[data-test-id="filtro-cores"]').getByText('{U}', { exact: true });

    await expect(btnRed).toBeVisible({ timeout: 15000 });

    const responsePromise = page.waitForResponse(
      (r) =>
        r.url().includes('/api/v1/cartas') &&
        r.url().includes('filters%5Bcolors%5D%5B%5D=U') &&
        r.url().includes('filters%5Bcolors%5D%5B%5D=R'),
    );

    await btnRed.click();
    await btnBlue.click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(
      json.data.cartas.every((c: any) => c.colors.includes('R') && c.colors.includes('U')),
    ).toBe(true);
  });

  test('deve filtrar por identidade de cor automaticamente no Commander', async ({ page }) => {
    const nomeUnico = `FiltroIdentidade_${Date.now()}`;
    await page.goto(`/decks/novo?nome=${nomeUnico}&formato=commander`);
    await page.waitForLoadState('networkidle');

    const buscaInput = page.locator('input[placeholder="Nome da carta..."]');
    await expect(buscaInput).toBeVisible({ timeout: 15000 });

    // Configura a captura ANTES de preencher o campo
    const responsePromiseBusca = page.waitForResponse(
      (r) =>
        r.url().includes('/api/v1/cartas') && r.url().includes('filters%5Bname%5D=Locust%20God'),
      { timeout: 15000 },
    );

    await buscaInput.fill('Locust God');
    await responsePromiseBusca;

    // Aguarda os resultados aparecerem no DOM
    await expect(page.getByTestId('btn-adicionar-comandante').first()).toBeVisible();

    // Clica no botão de estrela para adicionar como comandante
    const btnEstrela = page.getByTestId('btn-adicionar-comandante').first().getByRole('button');
    await btnEstrela.click();

    const toggleIdentidade = page.locator('[data-test-id="toggle-identidade"]');
    await expect(toggleIdentidade).toBeVisible({ timeout: 15000 });

    const responsePromiseFiltro = page.waitForResponse(
      (r) => r.url().includes('/api/v1/cartas') && r.url().includes('color_identity'),
      { timeout: 15000 },
    );

    // Click desativa, click ativa de novo para disparar a busca com identidade
    await toggleIdentidade.click();
    await toggleIdentidade.click();

    const response = await responsePromiseFiltro;
    const url = response.url();
    expect(url).toContain('filters%5Bcolor_identity%5D%5B%5D=U');
    expect(url).toContain('filters%5Bcolor_identity%5D%5B%5D=R');
  });
});
