import { test, expect } from '@playwright/test';
import { realizarLogin } from '../support/auth';

const API_IMPORTACOES = '**/api/v1/admin/importacoes';

test.describe('Gerenciamento de Importações Scryfall', () => {
  const mockImportacoes = [
    {
      id: 1,
      tipo: 'bulk_data',
      status: 'concluido',
      progresso: 100,
      startedAt: '2026-03-05T10:00:00Z',
      finishedAt: '2026-03-05T10:15:00Z',
      metadata: { updatedAt: '2026-03-01T00:00:00Z' },
      mensagemErro: null,
      createdAt: '2026-03-05T10:00:00Z',
    },
    {
      id: 2,
      tipo: 'simbolos',
      status: 'processando',
      progresso: 45,
      startedAt: '2026-03-05T11:00:00Z',
      finishedAt: null,
      metadata: null,
      mensagemErro: null,
      createdAt: '2026-03-05T11:00:00Z',
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock inicial da listagem
    await page.route(API_IMPORTACOES, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 200,
            data: { importacoes: mockImportacoes },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await realizarLogin(page);
  });

  test('deve exibir a tela corretamente para administrador', async ({ page }) => {
    await page.goto('/admin/importacoes');

    await expect(page.getByRole('heading', { name: 'Gerenciamento de Importação de Dados' })).toBeVisible();
    await expect(page.getByText('Histórico', { exact: true })).toBeVisible();

    // Verifica botões de ação
    await expect(page.getByRole('button', { name: 'Iniciar importação de símbolos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar importação de cartas (Bulk Data)' })).toBeVisible();

    // Verifica se a tabela contém os itens mockados
    await expect(page.getByRole('cell', { name: 'Símbolos' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Cartas' }).first()).toBeVisible();
    await expect(page.getByText('PROCESSANDO').first()).toBeVisible();
    await expect(page.getByText('45%').first()).toBeVisible();
  });

  test('deve atualizar o contador de polling e buscar novos dados automaticamente', async ({ page }) => {
    await page.goto('/admin/importacoes');

    // Verifica o contador inicial (5s no código)
    const contador = page.locator('span.text-primary');
    await expect(contador).toBeVisible();
    
    // Aguarda o contador diminuir
    const valorInicial = await contador.innerText();
    await page.waitForTimeout(1100);
    const valorDepois = await contador.innerText();
    
    expect(parseInt(valorDepois)).toBeLessThan(parseInt(valorInicial));

    // Mock de uma atualização que muda o progresso
    await page.route(API_IMPORTACOES, async (route) => {
      if (route.request().method() === 'GET') {
        const novosDados = JSON.parse(JSON.stringify(mockImportacoes));
        novosDados[1].progresso = 60;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 200, data: { importacoes: novosDados } }),
        });
      }
    });

    // Aguarda o polling (max 5s)
    await expect(page.getByText('60%').first()).toBeVisible({ timeout: 6000 });
  });

  test('deve permitir iniciar uma nova importação de símbolos e exibir toast', async ({ page }) => {
    await page.goto('/admin/importacoes');

    await page.route(API_IMPORTACOES, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ status: 201, data: { id: 3, tipo: 'simbolos', status: 'pendente' } }),
        });
      }
    });

    await page.getByRole('button', { name: 'Iniciar importação de símbolos' }).click();

    // Verifica o Toast de sucesso
    await expect(page.getByText('Importação enfileirada com sucesso')).toBeVisible();
  });

  test('deve permitir cancelar uma importação em andamento', async ({ page }) => {
    await page.goto('/admin/importacoes');

    // Mock do DELETE (cancelamento)
    let cancelado = false;
    await page.route('**/api/v1/admin/importacoes/2', async (route) => {
      if (route.request().method() === 'DELETE') {
        cancelado = true;
        await route.fulfill({ status: 204 });
      }
    });

    // Clica no botão de parar na tabela (id 2 é processando) usando o ícone
    const btnParar = page.locator('tr').filter({ hasText: 'Símbolos' }).locator('.pi-stop').locator('..');
    await btnParar.click();

    await expect(page.getByText('Solicitação de cancelamento enviada')).toBeVisible();
    expect(cancelado).toBe(true);
  });

  test('deve exibir mensagem de erro detalhada em caso de falha', async ({ page }) => {
    // Mock com erro (usando camelCase para os campos)
    const mockErro = [
      {
        id: 4,
        tipo: 'bulk_data',
        status: 'falha',
        progresso: 10,
        startedAt: '2026-03-05T12:00:00Z',
        mensagemErro: 'Erro de conexão com o Scryfall (Timeout)',
        createdAt: '2026-03-05T12:00:00Z',
      }
    ];

    await page.route(API_IMPORTACOES, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 200, data: { importacoes: mockErro } }),
      });
    });

    await page.goto('/admin/importacoes');

    // Verifica se a tag de falha está visível
    await expect(page.getByText('FALHA', { exact: true }).first()).toBeVisible();
    
    // Verifica se a mensagem de erro aparece no card
    await expect(page.getByText('Erro de conexão com o Scryfall (Timeout)')).toBeVisible();

    // Verifica o ícone de info na tabela
    const iconInfo = page.locator('i.pi-info-circle.text-red-500');
    await expect(iconInfo).toBeVisible();
  });

  test('não deve permitir acesso a usuários não autenticados', async ({ page }) => {
    // 1. Faz logout
    await page.goto('/');
    const btnLogout = page.getByRole('button').filter({ has: page.locator('.pi-sign-out') });
    await expect(btnLogout).toBeVisible();
    await btnLogout.click();
    
    // Espera o botão de login aparecer para confirmar que o estado foi limpo
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    
    // 2. Tenta acessar a rota restrita
    await page.goto('/admin/importacoes');
    
    // Deve ser redirecionado para a home (/) por causa do AdminGuard
    await expect(page).toHaveURL('http://localhost:4242/');
    expect(page.url()).not.toContain('/admin/importacoes');
  });
});
