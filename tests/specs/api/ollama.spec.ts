import { test, expect } from '@playwright/test';
import { ApiTestHelper } from './helpers/apiHelper';

let apiHelper: ApiTestHelper;

// OLLAMA_ENABLED=1 npx playwright test --grep @ollama

test.beforeAll(() => {
    test.skip(!process.env.OLLAMA_ENABLED, 'Ollama not enabled');

    const apiBaseUrl = process.env.API_BASE_URL || (process.env.BASE_URL ? process.env.BASE_URL+'/api' : 'http://localhost:1971');
    apiHelper = new ApiTestHelper(apiBaseUrl);
});

test.describe('Backend API - Ollama Integration', { tag: '@ollama' }, () => {
    test('should return a response from Ollama endpoint', async () => {
        // Test: Ollama endpoint should return a valid response
        // Expected behavior: POST /ollama with prompt should return 200 with response

        // Step 1: login
        const loginResponse = await apiHelper.login({login: 'anonymous', pwd: 'noPasswordForAnonymous'});
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty('access_token');
        const token = loginResponse.body.access_token;

        // Step 2: call Ollama endpoint
        const ollamaResponse = await apiHelper.post('/ollama', {
            prompt: 'Date of birth and date of death of Fyodor Dostoevsky?' // Example prompt - adjust as needed
            // prompt: 'Saluta l\'agente così gentile! Risposta breve.'
        }, { Authorization: `Bearer ${token}` });
        expect(ollamaResponse.status).toBe(200);
        expect(ollamaResponse.body).toHaveProperty('response');
        console.log('Ollama response:', ollamaResponse.body.response);
    });
});
