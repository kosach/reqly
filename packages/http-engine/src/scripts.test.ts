/**
 * Tests for script execution
 */

import { describe, it, expect } from 'vitest';
import { executePreRequestScript, executeTestScript } from './scripts';

describe('Script Execution', () => {
  describe('executePreRequestScript', () => {
    it('should set environment variables', async () => {
      const script = `
        pm.environment.set('apiKey', 'secret-123');
        pm.environment.set('timestamp', '1234567890');
      `;

      const result = await executePreRequestScript(script);

      expect(result.environment.apiKey).toBe('secret-123');
      expect(result.environment.timestamp).toBe('1234567890');
      expect(result.error).toBeUndefined();
    });

    it('should get environment variables', async () => {
      const script = `
        const existing = pm.environment.get('existingVar');
        pm.environment.set('result', existing);
      `;

      const result = await executePreRequestScript(script, {
        existingVar: 'test-value',
      });

      expect(result.environment.result).toBe('test-value');
    });

    it('should check if variable exists', async () => {
      const script = `
        const hasVar = pm.environment.has('test');
        pm.environment.set('hasTest', hasVar ? 'yes' : 'no');
      `;

      const result = await executePreRequestScript(script, { test: 'value' });

      expect(result.environment.hasTest).toBe('yes');
    });

    it('should unset variables', async () => {
      const script = `
        pm.environment.unset('toRemove');
      `;

      const result = await executePreRequestScript(script, {
        toRemove: 'value',
        toKeep: 'keep',
      });

      expect(result.environment.toRemove).toBeUndefined();
      expect(result.environment.toKeep).toBe('keep');
    });

    it('should use pm.variables alias', async () => {
      const script = `
        pm.variables.set('test', 'value');
        const result = pm.variables.get('test');
        pm.environment.set('result', result);
      `;

      const result = await executePreRequestScript(script);

      expect(result.environment.test).toBe('value');
      expect(result.environment.result).toBe('value');
    });

    it('should log with console.log', async () => {
      const script = `
        console.log('Test message');
        console.log('Number:', 42);
      `;

      const result = await executePreRequestScript(script);

      expect(result.logs.some(log => log.includes('Test message'))).toBe(true);
      expect(result.logs.some(log => log.includes('Number: 42'))).toBe(true);
    });

    it('should handle console.error', async () => {
      const script = `
        console.error('Error message');
      `;

      const result = await executePreRequestScript(script);

      expect(result.logs.some(log => log.includes('Error message'))).toBe(true);
    });

    it('should handle script errors', async () => {
      const script = `
        throw new Error('Script failed');
      `;

      const result = await executePreRequestScript(script);

      expect(result.error).toBe('Script failed');
      expect(result.logs.some(log => log.includes('Script failed'))).toBe(true);
    });

    it('should convert non-string values to strings', async () => {
      const script = `
        pm.environment.set('number', 42);
        pm.environment.set('boolean', true);
      `;

      const result = await executePreRequestScript(script);

      expect(result.environment.number).toBe('42');
      expect(result.environment.boolean).toBe('true');
    });

    it('should generate dynamic values', async () => {
      const script = `
        pm.environment.set('timestamp', Date.now());
        pm.environment.set('random', Math.random());
      `;

      const result = await executePreRequestScript(script);

      expect(result.environment.timestamp).toMatch(/^\d+$/);
      expect(result.environment.random).toMatch(/^0\.\d+$/);
    });
  });

  describe('executeTestScript', () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ success: true, data: { id: 42 } }),
      time: 150,
    };

    it('should run tests with pm.test', async () => {
      const script = `
        pm.test('Status is 200', () => {
          pm.response.to.have.status(200);
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests).toHaveLength(1);
      expect(result.tests[0].name).toBe('Status is 200');
      expect(result.tests[0].passed).toBe(true);
    });

    it('should fail tests when assertion fails', async () => {
      const script = `
        pm.test('Status is 404', () => {
          pm.response.to.have.status(404);
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests).toHaveLength(1);
      expect(result.tests[0].passed).toBe(false);
      expect(result.tests[0].error).toContain('Expected status 404');
    });

    it('should check for headers', async () => {
      const script = `
        pm.test('Has content-type header', () => {
          pm.response.to.have.header('content-type');
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests[0].passed).toBe(true);
    });

    it('should fail when header is missing', async () => {
      const script = `
        pm.test('Has missing header', () => {
          pm.response.to.have.header('x-missing');
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests[0].passed).toBe(false);
      expect(result.tests[0].error).toContain('not found');
    });

    it('should check response is OK', async () => {
      const script = `
        pm.test('Response is OK', () => {
          pm.response.to.be.ok();
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests[0].passed).toBe(true);
    });

    it('should fail when response is not OK', async () => {
      const script = `
        pm.test('Response is OK', () => {
          pm.response.to.be.ok();
        });
      `;

      const errorResponse = { ...mockResponse, status: 500 };
      const result = await executeTestScript(script, errorResponse);

      expect(result.tests[0].passed).toBe(false);
    });

    it('should parse JSON response', async () => {
      const script = `
        const json = pm.response.json();
        pm.test('Has success field', () => {
          pm.expect(json.success).to.equal(true);
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests[0].passed).toBe(true);
    });

    it('should access response properties', async () => {
      const script = `
        pm.test('Status code is 200', () => {
          pm.expect(pm.response.code).to.equal(200);
        });

        pm.test('Status text is OK', () => {
          pm.expect(pm.response.status).to.equal('OK');
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests).toHaveLength(2);
      expect(result.tests[0].passed).toBe(true);
      expect(result.tests[1].passed).toBe(true);
    });

    it('should use pm.expect for type checking', async () => {
      const script = `
        const json = pm.response.json();

        pm.test('data is object', () => {
          pm.expect(json.data).to.be.a('object');
        });

        pm.test('success is boolean', () => {
          pm.expect(json.success).to.be.a('boolean');
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests).toHaveLength(2);
      expect(result.tests[0].passed).toBe(true);
      expect(result.tests[1].passed).toBe(true);
    });

    it('should check for object properties', async () => {
      const script = `
        const json = pm.response.json();

        pm.test('Has data property', () => {
          pm.expect(json).to.have.property('data');
        });

        pm.test('Data has id', () => {
          pm.expect(json.data).to.have.property('id');
        });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests).toHaveLength(2);
      expect(result.tests[0].passed).toBe(true);
      expect(result.tests[1].passed).toBe(true);
    });

    it('should set variables from test script', async () => {
      const script = `
        const json = pm.response.json();
        pm.environment.set('userId', json.data.id.toString());
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.environment.userId).toBe('42');
    });

    it('should handle non-JSON responses', async () => {
      const script = `
        const text = pm.response.text();
        pm.test('Text is not empty', () => {
          pm.expect(text.length).to.be.a('number');
        });
      `;

      const textResponse = {
        ...mockResponse,
        body: 'Plain text response',
      };

      const result = await executeTestScript(script, textResponse);

      expect(result.tests[0].passed).toBe(true);
    });

    it('should run multiple tests', async () => {
      const script = `
        pm.test('Test 1', () => { pm.response.to.have.status(200); });
        pm.test('Test 2', () => { pm.response.to.be.ok(); });
        pm.test('Test 3', () => { pm.expect(pm.response.code).to.equal(200); });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.tests).toHaveLength(3);
      expect(result.tests.every(t => t.passed)).toBe(true);
    });

    it('should log test results', async () => {
      const script = `
        pm.test('Pass test', () => { pm.response.to.have.status(200); });
        pm.test('Fail test', () => { pm.response.to.have.status(404); });
      `;

      const result = await executeTestScript(script, mockResponse);

      expect(result.logs.some(log => log.includes('✓ Pass test'))).toBe(true);
      expect(result.logs.some(log => log.includes('✗ Fail test'))).toBe(true);
    });
  });
});
