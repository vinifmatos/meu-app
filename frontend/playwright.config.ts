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
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4242',
    trace: 'on-first-retry',
    headless: true,
    testIdAttribute: 'data-test-id',
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
        ? 'cd ../backend && RAILS_ENV=test bundle exec rails db:create db:migrate db:seed scryfall:importar_famosas && RAILS_ENV=test bundle exec rails server -p 3333'
        : 'cd ../backend && RAILS_ENV=test bundle exec rails db:drop db:create db:migrate db:seed scryfall:importar_famosas && RAILS_ENV=test bundle exec rails server -p 3333',
      url: 'http://localhost:3333/api/v1/config',
      reuseExistingServer: !process.env['CI'],
      timeout: 30000,
    },
    {
      command: process.env['CI']
        ? 'npx live-server dist/meu-app/browser --port=4242 --entry-file=index.html --proxy=/api:http://localhost:3333/api --no-browser'
        : 'yarn start --port 4242 --proxy-config proxy.e2e.conf.json',
      url: 'http://localhost:4242',
      reuseExistingServer: !process.env['CI'],
      timeout: 30000,
    },
  ],
});
