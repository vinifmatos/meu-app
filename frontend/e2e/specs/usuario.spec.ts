import { test, expect } from '@playwright/test';

test.describe('Gerenciamento de Usuário', () => {
  const timestamp = Date.now();
  const usuarioTeste = {
    username: `user_${timestamp}`,
    nome: 'Usuário de Teste',
    email: `test_${timestamp}@example.com`,
    senha: 'Password123@'
  };

  test('deve realizar o registro completo e validações de erro', async ({ page }) => {
    await page.goto('/registro');

    await page.fill('input[name="username"]', usuarioTeste.username);
    await page.fill('input[name="nome"]', usuarioTeste.nome);
    await page.fill('input[name="email"]', usuarioTeste.email);
    await page.fill('input[name="email_confirmation"]', usuarioTeste.email);
    
    // Testar validação de senhas divergentes
    await page.locator('#password input').fill(usuarioTeste.senha);
    const confirmInput = page.locator('#password_confirmation input');
    await confirmInput.fill('SenhaErrada123!');
    await confirmInput.blur(); // Forçar validação
    
    await expect(page.locator('text=As senhas não coincidem')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Corrigir senha e registrar
    await confirmInput.fill(usuarioTeste.senha);
    await confirmInput.blur();
    
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page.locator('p-message[severity="success"]')).toBeVisible({ timeout: 15000 });
  });

  test('deve validar o fluxo de confirmação de conta', async ({ page }) => {
    await page.goto('/confirmar-conta?token=token_invalido');
    await expect(page.locator('p-message[severity="error"]')).toBeVisible();
    await expect(page.locator('text=Token de confirmação inválido ou expirado')).toBeVisible();

    await page.goto('/confirmar-conta');
    await expect(page.locator('text=Token de confirmação não encontrado')).toBeVisible();
  });

  test.describe('Perfil do Usuário (Logado)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[id="username"]', 'admin');
      await page.locator('#password input').fill('Password123@');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/');
    });

    test('deve permitir alterar informações do perfil', async ({ page }) => {
      await page.goto('/perfil');
      
      // 1. Alterar Nome
      const novoNome = 'Administrador ' + Date.now();
      await page.fill('input[id="nome"]', novoNome);
      await page.click('button:has-text("Salvar Nome")');
      await expect(page.locator('p-message[severity="success"]')).toBeVisible();
      
      // Verificar se o valor no input mudou ou se aparece no texto da página
      const nomeInput = page.locator('input[id="nome"]');
      await expect(nomeInput).toHaveValue(novoNome);

      // 2. Alterar Senha com erro
      await page.locator('#current_password input').fill('SenhaErrada!');
      await page.locator('#password input').fill('NovaSenha123@');
      await page.locator('#password_confirmation input').fill('NovaSenha123@');
      await page.click('button:has-text("Alterar Senha")');
      await expect(page.locator('p-message[severity="error"]')).toBeVisible();
      await expect(page.locator('text=Senha atual incorreta')).toBeVisible();

      // 3. Alterar E-mail
      const novoEmail = `admin_${Date.now()}@example.com`;
      await page.fill('input[id="email"]', novoEmail);
      await page.click('button:has-text("Alterar E-mail")');
      await expect(page.locator('p-message[severity="success"]')).toBeVisible();
      await expect(page.locator('text=Aguardando confirmação para')).toBeVisible();
    });
  });
});
