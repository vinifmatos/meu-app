import { test, expect } from '@playwright/test';

test.describe('Rotas Públicas', () => {
  const rotasPublicas = [
    { url: '/', nome: 'Início' },
    { url: '/cartas', nome: 'Listagem de Cartas' },
    { url: '/decks', nome: 'Decks da Comunidade' },
    { url: '/login', nome: 'Login' }
  ];

  for (const rota of rotasPublicas) {
    test(`deve carregar a rota ${rota.url} sem erros de autorização`, async ({ page }) => {
      const consoleErrors: string[] = [];
      
      // Monitora erros de console e de rede
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(`[CONSOLE ERROR]: ${msg.text()}`);
        }
      });

      page.on('requestfailed', request => {
        consoleErrors.push(`[REQUEST FAILED]: ${request.url()} - ${request.failure()?.errorText}`);
      });

      // Intercepta respostas com erro 401
      page.on('response', response => {
        if (response.status() === 401 && !response.url().includes('/auth/')) {
          consoleErrors.push(`[401 UNAUTHORIZED] na URL: ${response.url()}`);
        }
      });

      await page.goto(rota.url);
      
      // Aguarda o carregamento básico da página (componentes principais)
      await page.waitForLoadState('networkidle');

      // Verifica se houve erros fatais ou de autorização no console
      expect(consoleErrors.length, `Foram encontrados erros ao carregar ${rota.url}:\n${consoleErrors.join('\n')}`).toBe(0);
      
      // Verifica se não foi redirecionado para o login (exceto na própria página de login)
      if (rota.url !== '/login') {
        expect(page.url()).not.toContain('/login?returnUrl=');
      }
    });
  }
});
