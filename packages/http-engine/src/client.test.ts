/**
 * E2E tests for HTTP client using httpbin.org
 */

import { describe, it, expect } from 'vitest';
import { HTTPClient } from './client';
import type { Environment, Variable } from '@reqly/types';

describe('HTTPClient E2E Tests', () => {
  const client = new HTTPClient({ timeout: 10000 });

  describe('Basic HTTP Methods', () => {
    it('should send GET request', async () => {
      const response = await client.get('https://httpbin.org/get');

      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
      expect(response.body).toContain('"url": "https://httpbin.org/get"');
      expect(response.time).toBeGreaterThan(0);
      expect(response.size).toBeGreaterThan(0);
    });

    it('should send POST request with JSON body', async () => {
      const body = JSON.stringify({ test: 'data', number: 42 });
      const response = await client.post(
        'https://httpbin.org/post',
        body,
        { 'Content-Type': 'application/json' }
      );

      expect(response.status).toBe(200);
      const responseData = JSON.parse(response.body);
      expect(responseData.json).toEqual({ test: 'data', number: 42 });
    });

    it('should send PUT request', async () => {
      const body = JSON.stringify({ updated: true });
      const response = await client.put(
        'https://httpbin.org/put',
        body,
        { 'Content-Type': 'application/json' }
      );

      expect(response.status).toBe(200);
      const responseData = JSON.parse(response.body);
      expect(responseData.json).toEqual({ updated: true });
    });

    it('should send DELETE request', async () => {
      const response = await client.delete('https://httpbin.org/delete');

      expect(response.status).toBe(200);
      expect(response.body).toContain('"url": "https://httpbin.org/delete"');
    });

    it('should send PATCH request', async () => {
      const body = JSON.stringify({ patched: 'field' });
      const response = await client.patch(
        'https://httpbin.org/patch',
        body,
        { 'Content-Type': 'application/json' }
      );

      expect(response.status).toBe(200);
      const responseData = JSON.parse(response.body);
      expect(responseData.json).toEqual({ patched: 'field' });
    });
  });

  describe('Headers', () => {
    it('should send custom headers', async () => {
      const response = await client.get('https://httpbin.org/headers', {
        'X-Custom-Header': 'test-value',
        'User-Agent': 'Reqly/1.0',
      });

      expect(response.status).toBe(200);
      const responseData = JSON.parse(response.body);
      expect(responseData.headers['X-Custom-Header']).toBe('test-value');
      expect(responseData.headers['User-Agent']).toBe('Reqly/1.0');
    });

    it('should handle authentication headers', async () => {
      const response = await client.get('https://httpbin.org/bearer', {
        Authorization: 'Bearer test-token-123',
      });

      expect(response.status).toBe(200);
      const responseData = JSON.parse(response.body);
      expect(responseData.token).toBe('test-token-123');
    });
  });

  describe('Variable Interpolation', () => {
    it('should interpolate variables in URL', async () => {
      const environment: Environment = {
        id: 'env-1',
        name: 'Test',
        variables: [{ key: 'userId', value: '42', type: 'default' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/get?user={{userId}}',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        environment,
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);
      expect(responseData.args.user).toBe('42');
      expect(result.logs.some(log => log.includes('user=42'))).toBe(true);
    });

    it('should interpolate variables in headers', async () => {
      const environment: Environment = {
        id: 'env-1',
        name: 'Test',
        variables: [{ key: 'apiKey', value: 'secret-key-123', type: 'secret' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/headers',
          headers: { 'X-API-Key': '{{apiKey}}' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        environment,
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);
      expect(responseData.headers['X-Api-Key']).toBe('secret-key-123');
    });

    it('should interpolate variables in request body', async () => {
      const environment: Environment = {
        id: 'env-1',
        name: 'Test',
        variables: [
          { key: 'username', value: 'john', type: 'default' },
          { key: 'email', value: 'john@example.com', type: 'default' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'POST',
          url: 'https://httpbin.org/post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: '{{username}}',
            email: '{{email}}',
          }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        environment,
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);
      expect(responseData.json).toEqual({
        username: 'john',
        email: 'john@example.com',
      });
    });

    it('should prefer environment variables over collection variables', async () => {
      const collectionVars: Variable[] = [
        { key: 'host', value: 'example.com', type: 'default' },
      ];

      const environment: Environment = {
        id: 'env-1',
        name: 'Test',
        variables: [{ key: 'host', value: 'httpbin.org', type: 'default' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://{{host}}/get',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        environment,
        collectionVariables: collectionVars,
      });

      expect(result.response.status).toBe(200);
      expect(result.logs.some(log => log.includes('httpbin.org'))).toBe(true);
    });
  });

  describe('Pre-Request Scripts', () => {
    it('should execute pre-request script and set variables', async () => {
      const preRequestScript = `
        pm.environment.set('timestamp', Date.now().toString());
        pm.environment.set('randomId', Math.floor(Math.random() * 1000).toString());
      `;

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'POST',
          url: 'https://httpbin.org/post',
          headers: {
            'Content-Type': 'application/json',
            'X-Timestamp': '{{timestamp}}',
            'X-Random-ID': '{{randomId}}',
          },
          body: JSON.stringify({ id: '{{randomId}}' }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        preRequestScript,
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);

      // Check that script-generated values were interpolated
      expect(responseData.headers['X-Timestamp']).toMatch(/^\d+$/);
      expect(responseData.headers['X-Random-Id']).toMatch(/^\d+$/);
      expect(responseData.json.id).toMatch(/^\d+$/);

      // Check logs
      expect(result.logs.some(log => log.includes('Executing pre-request script'))).toBe(true);
      expect(result.logs.some(log => log.includes('Set variable: timestamp'))).toBe(true);
    });

    it('should use console.log in scripts', async () => {
      const preRequestScript = `
        console.log('Starting pre-request script');
        pm.environment.set('test', 'value');
        console.log('Script completed');
      `;

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        preRequestScript,
      });

      expect(result.response.status).toBe(200);
      expect(result.logs.some(log => log.includes('Starting pre-request script'))).toBe(true);
      expect(result.logs.some(log => log.includes('Script completed'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await client.get('https://httpbin.org/status/404');

      expect(response.status).toBe(404);
      expect(response.statusText).toBe('NOT FOUND');
    });

    it('should handle 500 errors', async () => {
      const response = await client.get('https://httpbin.org/status/500');

      expect(response.status).toBe(500);
      expect(response.statusText).toBe('INTERNAL SERVER ERROR');
    });

    it('should handle network timeouts', async () => {
      const shortTimeoutClient = new HTTPClient({ timeout: 100 });

      const result = await shortTimeoutClient.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/delay/10', // 10 second delay
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      expect(result.response.status).toBe(0);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('timeout');
      expect(result.logs.some(log => log.includes('Request failed'))).toBe(true);
    });

    it('should handle invalid URLs', async () => {
      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'not-a-valid-url',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      expect(result.response.status).toBe(0);
      expect(result.error).toBeDefined();
    });

    it('should handle script errors gracefully', async () => {
      const preRequestScript = `
        throw new Error('Script error');
      `;

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        preRequestScript,
      });

      // Request should still complete even if script fails
      expect(result.response.status).toBe(200);
      expect(result.logs.some(log => log.includes('Script error'))).toBe(true);
    });
  });

  describe('Response Logging', () => {
    it('should log request and response details', async () => {
      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'POST',
          url: 'https://httpbin.org/post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: 'data' }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      expect(result.logs).toBeDefined();
      expect(result.logs.length).toBeGreaterThan(0);

      // Check for key log entries
      expect(result.logs.some(log => log.includes('Starting request'))).toBe(true);
      expect(result.logs.some(log => log.includes('POST'))).toBe(true);
      expect(result.logs.some(log => log.includes('Response received'))).toBe(true);
      expect(result.logs.some(log => log.includes('200 OK'))).toBe(true);
      expect(result.logs.some(log => log.includes('Response size'))).toBe(true);
    });

    it('should log environment variables count', async () => {
      const environment: Environment = {
        id: 'env-1',
        name: 'Test',
        variables: [
          { key: 'var1', value: 'value1', type: 'default' },
          { key: 'var2', value: 'value2', type: 'default' },
          { key: 'var3', value: 'value3', type: 'default' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        environment,
      });

      expect(result.logs.some(log => log.includes('3 variables loaded'))).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should apply bearer token authentication', async () => {
      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/bearer',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        collectionAuth: {
          type: 'bearer',
          bearer: { token: 'test-bearer-token' },
        },
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);
      expect(responseData.token).toBe('test-bearer-token');
      expect(result.logs.some(log => log.includes('Applied bearer authentication'))).toBe(true);
    });

    it('should apply basic authentication', async () => {
      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/basic-auth/testuser/testpass',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        collectionAuth: {
          type: 'basic',
          basic: { username: 'testuser', password: 'testpass' },
        },
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);
      expect(responseData.authenticated).toBe(true);
      expect(responseData.user).toBe('testuser');
    });

    it('should apply API key in headers', async () => {
      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/headers',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        collectionAuth: {
          type: 'api-key',
          apiKey: { key: 'X-API-Key', value: 'secret-key-123', in: 'header' },
        },
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);
      expect(responseData.headers['X-Api-Key']).toBe('secret-key-123');
    });

    it('should apply API key in query params', async () => {
      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        collectionAuth: {
          type: 'api-key',
          apiKey: { key: 'api_key', value: 'secret-query-key', in: 'query' },
        },
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);
      expect(responseData.args.api_key).toBe('secret-query-key');
    });

    it('should combine auth with variable interpolation', async () => {
      const environment: Environment = {
        id: 'env-1',
        name: 'Test',
        variables: [{ key: 'username', value: 'john', type: 'default' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/basic-auth/{{username}}/mypassword',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        environment,
        collectionAuth: {
          type: 'basic',
          basic: { username: 'john', password: 'mypassword' },
        },
      });

      expect(result.response.status).toBe(200);
      const responseData = JSON.parse(result.response.body);
      expect(responseData.authenticated).toBe(true);
    });
  });

  describe('Test Scripts', () => {
    it('should execute test scripts with assertions', async () => {
      const testScript = `
        pm.test('Status is 200', () => {
          pm.response.to.have.status(200);
        });

        pm.test('Response has URL field', () => {
          const json = pm.response.json();
          pm.expect(json).to.have.property('url');
        });
      `;

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        testScript,
      });

      expect(result.response.status).toBe(200);
      expect(result.scriptOutput?.test).toBeDefined();
      expect(result.scriptOutput?.test?.length).toBe(2);
      expect(result.scriptOutput?.test?.[0].passed).toBe(true);
      expect(result.scriptOutput?.test?.[1].passed).toBe(true);
    });

    it('should fail tests when assertions fail', async () => {
      const testScript = `
        pm.test('Status is 404', () => {
          pm.response.to.have.status(404);
        });
      `;

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        testScript,
      });

      expect(result.response.status).toBe(200);
      expect(result.scriptOutput?.test?.[0].passed).toBe(false);
      expect(result.scriptOutput?.test?.[0].error).toContain('Expected status 404');
    });

    it('should extract data with test scripts', async () => {
      const testScript = `
        const json = pm.response.json();
        pm.environment.set('extractedUrl', json.url);

        pm.test('Data extracted', () => {
          pm.expect(pm.environment.get('extractedUrl')).to.be.a('string');
        });
      `;

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/get',
          headers: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        testScript,
      });

      expect(result.scriptOutput?.test?.[0].passed).toBe(true);
      expect(result.logs.some(log => log.includes('extractedUrl'))).toBe(true);
    });

    it('should combine pre-request and test scripts', async () => {
      const preRequestScript = `
        pm.environment.set('customHeader', 'test-value-123');
      `;

      const testScript = `
        const json = pm.response.json();

        pm.test('Custom header was sent', () => {
          pm.expect(json.headers['X-Custom']).to.equal('test-value-123');
        });
      `;

      const result = await client.sendRequest({
        request: {
          id: 'req-1',
          name: 'Test Request',
          method: 'GET',
          url: 'https://httpbin.org/headers',
          headers: { 'X-Custom': '{{customHeader}}' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        preRequestScript,
        testScript,
      });

      expect(result.scriptOutput?.test?.[0].passed).toBe(true);
    });
  });

  describe('Content Types', () => {
    it('should handle form-data', async () => {
      const formData = new URLSearchParams();
      formData.append('field1', 'value1');
      formData.append('field2', 'value2');

      const response = await client.post(
        'https://httpbin.org/post',
        formData.toString(),
        { 'Content-Type': 'application/x-www-form-urlencoded' }
      );

      expect(response.status).toBe(200);
      const responseData = JSON.parse(response.body);
      expect(responseData.form).toEqual({
        field1: 'value1',
        field2: 'value2',
      });
    });

    it('should handle raw text', async () => {
      const rawText = 'This is raw text data';

      const response = await client.post(
        'https://httpbin.org/post',
        rawText,
        { 'Content-Type': 'text/plain' }
      );

      expect(response.status).toBe(200);
      const responseData = JSON.parse(response.body);
      expect(responseData.data).toBe(rawText);
    });

    it('should handle XML', async () => {
      const xml = '<?xml version="1.0"?><root><item>test</item></root>';

      const response = await client.post(
        'https://httpbin.org/post',
        xml,
        { 'Content-Type': 'application/xml' }
      );

      expect(response.status).toBe(200);
      const responseData = JSON.parse(response.body);
      expect(responseData.data).toBe(xml);
    });
  });
});
