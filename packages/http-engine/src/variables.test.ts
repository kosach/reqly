/**
 * Tests for variable interpolation
 */

import { describe, it, expect } from 'vitest';
import {
  interpolateVariables,
  extractVariableNames,
  validateVariables,
  interpolateObject,
} from './variables';

describe('Variable Interpolation', () => {
  describe('interpolateVariables', () => {
    it('should interpolate single variable', () => {
      const result = interpolateVariables(
        'Hello {{name}}!',
        { name: 'World' }
      );
      expect(result).toBe('Hello World!');
    });

    it('should interpolate multiple variables', () => {
      const result = interpolateVariables(
        'https://{{host}}/api/{{version}}/users',
        { host: 'example.com', version: 'v1' }
      );
      expect(result).toBe('https://example.com/api/v1/users');
    });

    it('should handle variables with spaces', () => {
      const result = interpolateVariables(
        'Hello {{ name }}!',
        { name: 'World' }
      );
      expect(result).toBe('Hello World!');
    });

    it('should preserve missing variables', () => {
      const result = interpolateVariables(
        'Hello {{name}}, age {{age}}',
        { name: 'John' }
      );
      expect(result).toBe('Hello John, age {{age}}');
    });

    it('should handle empty variables object', () => {
      const result = interpolateVariables(
        'Hello {{name}}',
        {}
      );
      expect(result).toBe('Hello {{name}}');
    });

    it('should handle string without variables', () => {
      const result = interpolateVariables(
        'No variables here',
        { name: 'World' }
      );
      expect(result).toBe('No variables here');
    });

    it('should handle consecutive variables', () => {
      const result = interpolateVariables(
        '{{first}}{{second}}',
        { first: 'Hello', second: 'World' }
      );
      expect(result).toBe('HelloWorld');
    });

    it('should handle same variable multiple times', () => {
      const result = interpolateVariables(
        '{{name}} is {{name}}',
        { name: 'great' }
      );
      expect(result).toBe('great is great');
    });

    it('should handle numeric values', () => {
      const result = interpolateVariables(
        'Port: {{port}}',
        { port: '8080' }
      );
      expect(result).toBe('Port: 8080');
    });

    it('should handle special characters in values', () => {
      const result = interpolateVariables(
        'Token: {{token}}',
        { token: 'abc-123_def.456' }
      );
      expect(result).toBe('Token: abc-123_def.456');
    });
  });

  describe('extractVariableNames', () => {
    it('should extract single variable name', () => {
      const names = extractVariableNames('Hello {{name}}');
      expect(names).toEqual(['name']);
    });

    it('should extract multiple variable names', () => {
      const names = extractVariableNames('{{protocol}}://{{host}}:{{port}}');
      expect(names).toEqual(['protocol', 'host', 'port']);
    });

    it('should extract variable names with spaces', () => {
      const names = extractVariableNames('{{ name }} and {{ age }}');
      expect(names).toEqual(['name', 'age']);
    });

    it('should return empty array for no variables', () => {
      const names = extractVariableNames('No variables here');
      expect(names).toEqual([]);
    });

    it('should handle duplicate variable names', () => {
      const names = extractVariableNames('{{name}} is {{name}}');
      expect(names).toEqual(['name', 'name']);
    });
  });

  describe('validateVariables', () => {
    it('should validate when all variables are available', () => {
      const result = validateVariables(
        'https://{{host}}/{{path}}',
        { host: 'example.com', path: 'api' }
      );
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should detect missing variables', () => {
      const result = validateVariables(
        'https://{{host}}/{{path}}',
        { host: 'example.com' }
      );
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['path']);
    });

    it('should detect multiple missing variables', () => {
      const result = validateVariables(
        '{{protocol}}://{{host}}:{{port}}',
        { host: 'example.com' }
      );
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['protocol', 'port']);
    });

    it('should validate string without variables', () => {
      const result = validateVariables(
        'No variables',
        {}
      );
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });
  });

  describe('interpolateObject', () => {
    it('should interpolate all values in object', () => {
      const result = interpolateObject(
        {
          url: 'https://{{host}}/api',
          header: 'Bearer {{token}}',
        },
        { host: 'example.com', token: 'secret' }
      );

      expect(result).toEqual({
        url: 'https://example.com/api',
        header: 'Bearer secret',
      });
    });

    it('should handle empty object', () => {
      const result = interpolateObject({}, { name: 'value' });
      expect(result).toEqual({});
    });

    it('should preserve missing variables in object values', () => {
      const result = interpolateObject(
        {
          url: 'https://{{host}}/{{path}}',
          header: '{{token}}',
        },
        { host: 'example.com' }
      );

      expect(result).toEqual({
        url: 'https://example.com/{{path}}',
        header: '{{token}}',
      });
    });
  });
});
