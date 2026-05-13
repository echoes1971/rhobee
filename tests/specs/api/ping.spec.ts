import { test, expect } from '@playwright/test';
import { ApiTestHelper } from './helpers/apiHelper';

let apiHelper: ApiTestHelper;

test.beforeAll(() => {
  // Endpoints inferred from docker-compose.dev.yml
  // Local backend service: http://localhost:1971
  // Docker network: http://be:1971
  const apiBaseUrl = process.env.API_BASE_URL || (process.env.BASE_URL ? process.env.BASE_URL+'/api' : 'http://localhost:1971');
  apiHelper = new ApiTestHelper(apiBaseUrl);
});

test.describe('Backend API - Health Check', () => {
  test('should return pong on ping endpoint', async () => {
    // Test: Health check endpoint should respond with pong
    // Expected behavior: GET /ping should return 200 with "Pong"

    const response = await apiHelper.ping();

    expect(response.status).toBe(200);
    console.log('Ping response body:', response.body); // Log the response body for debugging
    expect(response.body).toHaveProperty('ping');
    expect(response.body.ping).toBe('Pong');
  });

  test('ping endpoint should be accessible without authentication', async () => {
    // Test: Health check should work for unauthenticated users
    // Expected behavior: No auth token required

    const response = await apiHelper.ping();

    expect(response.status).toBe(200);
  });
});
