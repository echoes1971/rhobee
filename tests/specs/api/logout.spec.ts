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

test.describe('Backend API - Logout', () => {
  test('should successfully logout with valid token', async () => {
    // Test: Logout endpoint should invalidate JWT token
    // Expected behavior: POST /logout with valid token should return 200

    // First, login to get a token
    const loginResponse = await apiHelper.login({
      login: 'anonymous',
      pwd: 'noPasswordForAnonymous',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('access_token');

    // Then, logout using the token
    const token = loginResponse.body.access_token;
    const logoutResponse = await apiHelper.logout(token);

    expect(logoutResponse.status).toBe(200);
  });

  test('should fail logout with invalid token', async () => {
    // Test: Logout with invalid token should be rejected
    // Expected behavior: POST /logout with invalid token should return 401

    const invalidToken = 'invalid.jwt.token';
    const response = await apiHelper.logout(invalidToken);

    expect(response.status).toBe(401);
  });

  test('should fail logout without token', async () => {
    // Test: Logout without providing a token should be rejected
    // Expected behavior: POST /logout without auth header should return 401

    const response = await apiHelper.post('/logout', {});

    expect(response.status).toBe(401);
  });
});
