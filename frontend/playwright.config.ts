import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Configuramos múltiplos webServers: um para o backend e outro para o frontend
  webServer: [
    {
      command: process.env['CI']
        ? 'cd ../backend && RAILS_ENV=test bundle exec rails server -p 3333'
        : 'cd ../backend && RAILS_ENV=test bundle exec rails db:drop db:create db:migrate db:seed && RAILS_ENV=test bundle exec rails server -p 3333',
      url: 'http://localhost:3333/api/v1/config',
      reuseExistingServer: !process.env['CI'],
      timeout: 120000,
    },
    {
      command: process.env['CI'] 
        ? 'npx http-server dist/meu-app/browser -p 4200 -g --proxy http://localhost:4200/api=http://localhost:3333/api'
        : 'yarn start --port 4200 --proxy-config proxy.e2e.conf.json',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 120000,
    }
  ],
});
