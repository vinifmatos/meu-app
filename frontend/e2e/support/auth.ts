import { Page, expect } from '@playwright/test';

export const TEST_USER = process.env['E2E_USER'] ?? 'admin';
export const TEST_PASSWORD = process.env['E2E_PASSWORD'] ?? 'Password123@';

export async function realizarLogin(page: Page, user = TEST_USER, pass = TEST_PASSWORD) {
  await page.goto('/login');
  await page.fill('input[id="username"]', user);
  await page.locator('#password input').fill(pass);
  await page.click('button[type="submit"]');
  
  // Aguarda o redirecionamento ou a mudança de estado que indica login bem sucedido
  await expect(page).not.toHaveURL(/\/login/);
  // Garante que o Angular terminou de carregar a página de destino
  await page.waitForLoadState('networkidle');
}
