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

test.describe('Backend API - Login', () => {
  test('should successfully login with valid credentials', async () => {
    // TODO: Implement login test with valid credentials
    // Expected behavior: POST /login should return 200 with auth token
    
    const response = await apiHelper.login({
      login: 'anonymous',
      pwd: 'noPasswordForAnonymous',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
  });

  test('should fail login with invalid credentials', async () => {
    // TODO: Implement login failure test with invalid credentials
    // Expected behavior: POST /login should return 401 or 400
    
    const response = await apiHelper.login({
      login: 'testuser',
      pwd: 'wrongpassword',
    });

    expect(response.status).toBeLessThanOrEqual(401);
  });

  test('should fail login with missing credentials', async () => {
    // TODO: Implement login failure test with missing fields
    // Expected behavior: POST /login should return 400
    
    const response = await apiHelper.login({
      login: '',
      pwd: '',
    });

    expect(response.status).toBe(401);

    // Show response.body in the test results for debugging
    console.log('Response body for missing credentials:', response.body);
  });
});