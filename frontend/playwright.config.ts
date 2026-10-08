import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, retries: 0,
  use: { baseURL: 'http://127.0.0.1:8026', browserName: 'chromium', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: '"' + (process.env.SIGNALRANK_E2E_PYTHON || '.venv/bin/python') + '" -m signalrank.e2e_server',
    cwd: '..', url: 'http://127.0.0.1:8026/api/health', reuseExistingServer: false, timeout: 120000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
  },
});
