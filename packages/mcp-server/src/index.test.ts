/**
 * E2E tests for MCP server tools
 * Tests all 4 tools with real HTTP calls to httpbin.org
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ReqlyDatabase } from '@reqly/database';
import { createCollection } from './tools/createCollection';
import { createRequest } from './tools/createRequest';
import { sendRequest } from './tools/sendRequest';
import { writeTest } from './tools/writeTest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('MCP Server E2E Tests', () => {
  let db: ReqlyDatabase;
  let testDbPath: string;
  let collectionId: string;
  let requestId: string;
  let environmentId: string;

  beforeAll(() => {
    // Create temporary database for testing
    testDbPath = path.join(os.tmpdir(), `reqly-test-${Date.now()}.db`);
    db = new ReqlyDatabase(testDbPath);

    // Create a test environment with variables
    const env = db.createEnvironment({
      name: 'Test Environment',
      variables: [
        { key: 'baseUrl', value: 'https://httpbin.org', type: 'default' },
        { key: 'apiKey', value: 'test-key-123', type: 'secret' },
      ],
    });
    environmentId = env.id;
  });

  afterAll(() => {
    // Clean up test database
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('createCollection tool', () => {
    it('should create a collection with name only', async () => {
      const result = await createCollection(db, {
        name: 'Test Collection',
      });

      expect(result.success).toBe(true);
      expect(result.collectionId).toBeDefined();
      collectionId = result.collectionId!;

      // Verify collection was created in database
      const collection = db.getCollection(collectionId);
      expect(collection).toBeDefined();
      expect(collection?.name).toBe('Test Collection');
    });

    it('should create a collection with variables', async () => {
      const result = await createCollection(db, {
        name: 'Collection with Variables',
        description: 'Test collection',
        variables: [
          { key: 'var1', value: 'value1', type: 'default' },
          { key: 'var2', value: 'value2', type: 'secret' },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.collectionId).toBeDefined();

      const collection = db.getCollection(result.collectionId!);
      expect(collection?.variables).toHaveLength(2);
      expect(collection?.variables?.[0].key).toBe('var1');
    });

    it('should create a collection with bearer auth', async () => {
      const result = await createCollection(db, {
        name: 'Collection with Auth',
        auth: {
          type: 'bearer',
          bearer: { token: '{{apiKey}}' },
        },
      });

      expect(result.success).toBe(true);
      expect(result.collectionId).toBeDefined();

      const collection = db.getCollection(result.collectionId!);
      expect(collection?.auth?.type).toBe('bearer');
      expect(collection?.auth?.bearer?.token).toBe('{{apiKey}}');
    });

    it('should fail with empty name', async () => {
      const result = await createCollection(db, {
        name: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('createRequest tool', () => {
    it('should create a GET request', async () => {
      const result = await createRequest(db, {
        collectionId,
        name: 'Get IP',
        method: 'GET',
        url: '{{baseUrl}}/ip',
      });

      expect(result.success).toBe(true);
      expect(result.requestId).toBeDefined();
      requestId = result.requestId!;

      const request = db.getRequest(requestId);
      expect(request?.method).toBe('GET');
      expect(request?.url).toBe('{{baseUrl}}/ip');
    });

    it('should create a POST request with headers and body', async () => {
      const result = await createRequest(db, {
        collectionId,
        name: 'Post Data',
        method: 'POST',
        url: '{{baseUrl}}/post',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'test',
        },
        body: JSON.stringify({ test: 'data', key: '{{apiKey}}' }),
      });

      expect(result.success).toBe(true);
      expect(result.requestId).toBeDefined();

      const request = db.getRequest(result.requestId!);
      expect(request?.method).toBe('POST');
      expect(request?.headers['Content-Type']).toBe('application/json');
      expect(request?.body).toContain('test');
    });

    it('should fail with invalid collection ID', async () => {
      const result = await createRequest(db, {
        collectionId: 'invalid-id',
        name: 'Test',
        method: 'GET',
        url: 'https://httpbin.org/get',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail with empty name', async () => {
      const result = await createRequest(db, {
        collectionId,
        name: '',
        method: 'GET',
        url: 'https://httpbin.org/get',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('sendRequest tool', () => {
    it('should execute a GET request successfully', async () => {
      // Create a simple GET request
      const createResult = await createRequest(db, {
        collectionId,
        name: 'Test GET',
        method: 'GET',
        url: 'https://httpbin.org/get',
      });

      const result = await sendRequest(db, {
        requestId: createResult.requestId!,
      });

      expect(result.success).toBe(true);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(200);
      expect(result.response?.body).toContain('httpbin.org');
      expect(result.response?.time).toBeGreaterThan(0);
      expect(result.logs).toBeDefined();
      expect(result.logs!.length).toBeGreaterThan(0);
    });

    it('should execute request with variable interpolation', async () => {
      // requestId from earlier test already has {{baseUrl}}
      const result = await sendRequest(db, {
        requestId,
        environmentId,
      });

      expect(result.success).toBe(true);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(200);
      expect(result.logs?.some(log => log.includes('httpbin.org'))).toBe(true);
    });

    it('should execute POST request with JSON body', async () => {
      const createResult = await createRequest(db, {
        collectionId,
        name: 'Test POST',
        method: 'POST',
        url: 'https://httpbin.org/post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Hello from Reqly' }),
      });

      const result = await sendRequest(db, {
        requestId: createResult.requestId!,
      });

      expect(result.success).toBe(true);
      expect(result.response?.status).toBe(200);
      expect(result.response?.body).toContain('Hello from Reqly');
    });

    it('should handle custom headers', async () => {
      const createResult = await createRequest(db, {
        collectionId,
        name: 'Test Headers',
        method: 'GET',
        url: 'https://httpbin.org/headers',
        headers: {
          'X-Custom-Header': 'test-value',
          'X-Api-Key': '{{apiKey}}',
        },
      });

      const result = await sendRequest(db, {
        requestId: createResult.requestId!,
        environmentId,
      });

      expect(result.success).toBe(true);
      expect(result.response?.status).toBe(200);
      expect(result.response?.body).toContain('X-Custom-Header');
      expect(result.response?.body).toContain('test-key-123'); // Interpolated value
    });

    it('should handle different HTTP methods', async () => {
      const methods: Array<'PUT' | 'DELETE' | 'PATCH'> = ['PUT', 'DELETE', 'PATCH'];

      for (const method of methods) {
        const createResult = await createRequest(db, {
          collectionId,
          name: `Test ${method}`,
          method,
          url: `https://httpbin.org/${method.toLowerCase()}`,
          headers: method !== 'DELETE' ? { 'Content-Type': 'application/json' } : {},
          body: method !== 'DELETE' ? JSON.stringify({ test: true }) : undefined,
        });

        const result = await sendRequest(db, {
          requestId: createResult.requestId!,
        });

        expect(result.success).toBe(true);
        expect(result.response?.status).toBe(200);
      }
    });

    it('should fail with invalid request ID', async () => {
      const result = await sendRequest(db, {
        requestId: 'invalid-id',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail with invalid environment ID', async () => {
      const result = await sendRequest(db, {
        requestId,
        environmentId: 'invalid-id',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('writeTest tool', () => {
    it('should add test script to request', async () => {
      const result = await writeTest(db, {
        requestId,
        testScript: `
          pm.test('Status is 200', () => {
            pm.response.to.have.status(200);
          });
        `,
      });

      expect(result.success).toBe(true);
    });

    it('should fail with empty test script', async () => {
      const result = await writeTest(db, {
        requestId,
        testScript: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should fail with invalid request ID', async () => {
      const result = await writeTest(db, {
        requestId: 'invalid-id',
        testScript: 'pm.test("Test", () => {});',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Integration: Full workflow', () => {
    it('should complete full API testing workflow', async () => {
      // 1. Create collection
      const collResult = await createCollection(db, {
        name: 'Integration Test Collection',
        variables: [
          { key: 'host', value: 'https://httpbin.org', type: 'default' },
        ],
      });
      expect(collResult.success).toBe(true);

      // 2. Create request
      const reqResult = await createRequest(db, {
        collectionId: collResult.collectionId!,
        name: 'Integration Test Request',
        method: 'GET',
        url: '{{host}}/status/200',
      });
      expect(reqResult.success).toBe(true);

      // 3. Add tests
      const testResult = await writeTest(db, {
        requestId: reqResult.requestId!,
        testScript: `
          pm.test('Status is 200', () => {
            pm.response.to.have.status(200);
          });
        `,
      });
      expect(testResult.success).toBe(true);

      // 4. Execute request
      const sendResult = await sendRequest(db, {
        requestId: reqResult.requestId!,
        environmentId,
      });
      expect(sendResult.success).toBe(true);
      expect(sendResult.response?.status).toBe(200);
    });
  });
});
