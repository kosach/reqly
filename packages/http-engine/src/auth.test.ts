/**
 * Tests for authentication handling
 */

import { describe, it, expect } from 'vitest';
import { applyAuth, applyAuthToUrl, validateAuth } from './auth';
import type { AuthConfig } from '@reqly/types';

describe('Authentication', () => {
  describe('applyAuth', () => {
    it('should not modify headers for no auth', () => {
      const headers = { 'Content-Type': 'application/json' };
      const auth: AuthConfig = { type: 'none' };

      const result = applyAuth(headers, auth);

      expect(result).toEqual(headers);
    });

    it('should not modify headers when auth is undefined', () => {
      const headers = { 'Content-Type': 'application/json' };

      const result = applyAuth(headers);

      expect(result).toEqual(headers);
    });

    it('should apply bearer token', () => {
      const headers = { 'Content-Type': 'application/json' };
      const auth: AuthConfig = {
        type: 'bearer',
        bearer: { token: 'my-secret-token' },
      };

      const result = applyAuth(headers, auth);

      expect(result['Authorization']).toBe('Bearer my-secret-token');
      expect(result['Content-Type']).toBe('application/json');
    });

    it('should apply basic auth', () => {
      const headers = {};
      const auth: AuthConfig = {
        type: 'basic',
        basic: { username: 'user', password: 'pass' },
      };

      const result = applyAuth(headers, auth);

      // user:pass in base64 is dXNlcjpwYXNz
      expect(result['Authorization']).toBe('Basic dXNlcjpwYXNz');
    });

    it('should apply API key to headers', () => {
      const headers = {};
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'X-API-Key', value: 'secret-key-123', in: 'header' },
      };

      const result = applyAuth(headers, auth);

      expect(result['X-API-Key']).toBe('secret-key-123');
    });

    it('should not apply API key to headers when in query', () => {
      const headers = {};
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'api_key', value: 'secret', in: 'query' },
      };

      const result = applyAuth(headers, auth);

      expect(result['api_key']).toBeUndefined();
    });

    it('should preserve existing headers', () => {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Reqly/1.0',
      };
      const auth: AuthConfig = {
        type: 'bearer',
        bearer: { token: 'token' },
      };

      const result = applyAuth(headers, auth);

      expect(result['Content-Type']).toBe('application/json');
      expect(result['User-Agent']).toBe('Reqly/1.0');
      expect(result['Authorization']).toBe('Bearer token');
    });
  });

  describe('applyAuthToUrl', () => {
    it('should not modify URL for non-API-key auth', () => {
      const url = 'https://api.example.com/users';
      const auth: AuthConfig = {
        type: 'bearer',
        bearer: { token: 'token' },
      };

      const result = applyAuthToUrl(url, auth);

      expect(result).toBe(url);
    });

    it('should not modify URL when API key is in header', () => {
      const url = 'https://api.example.com/users';
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'X-API-Key', value: 'secret', in: 'header' },
      };

      const result = applyAuthToUrl(url, auth);

      expect(result).toBe(url);
    });

    it('should add API key to query params', () => {
      const url = 'https://api.example.com/users';
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'api_key', value: 'secret-123', in: 'query' },
      };

      const result = applyAuthToUrl(url, auth);

      expect(result).toBe('https://api.example.com/users?api_key=secret-123');
    });

    it('should add API key to existing query params', () => {
      const url = 'https://api.example.com/users?limit=10&page=2';
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'api_key', value: 'secret', in: 'query' },
      };

      const result = applyAuthToUrl(url, auth);

      expect(result).toContain('api_key=secret');
      expect(result).toContain('limit=10');
      expect(result).toContain('page=2');
    });

    it('should handle URL with hash', () => {
      const url = 'https://api.example.com/users#section';
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'key', value: 'value', in: 'query' },
      };

      const result = applyAuthToUrl(url, auth);

      expect(result).toContain('key=value');
      expect(result).toContain('#section');
    });

    it('should return original URL if parsing fails', () => {
      const invalidUrl = 'not-a-valid-url';
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'key', value: 'value', in: 'query' },
      };

      const result = applyAuthToUrl(invalidUrl, auth);

      expect(result).toBe(invalidUrl);
    });
  });

  describe('validateAuth', () => {
    it('should validate none auth', () => {
      const auth: AuthConfig = { type: 'none' };

      const result = validateAuth(auth);

      expect(result.valid).toBe(true);
    });

    it('should validate bearer auth with token', () => {
      const auth: AuthConfig = {
        type: 'bearer',
        bearer: { token: 'token' },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(true);
    });

    it('should reject bearer auth without token', () => {
      const auth: AuthConfig = {
        type: 'bearer',
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('token');
    });

    it('should validate basic auth with credentials', () => {
      const auth: AuthConfig = {
        type: 'basic',
        basic: { username: 'user', password: 'pass' },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(true);
    });

    it('should reject basic auth without username', () => {
      const auth: AuthConfig = {
        type: 'basic',
        basic: { username: '', password: 'pass' },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('username');
    });

    it('should reject basic auth without password', () => {
      const auth: AuthConfig = {
        type: 'basic',
        basic: { username: 'user', password: '' },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('password');
    });

    it('should validate API key auth', () => {
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'X-API-Key', value: 'secret', in: 'header' },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(true);
    });

    it('should reject API key without key name', () => {
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: '', value: 'secret', in: 'header' },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('key name');
    });

    it('should reject API key without value', () => {
      const auth: AuthConfig = {
        type: 'api-key',
        apiKey: { key: 'X-API-Key', value: '', in: 'header' },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('value');
    });

    it('should validate OAuth2', () => {
      const auth: AuthConfig = {
        type: 'oauth2',
        oauth2: {
          grantType: 'client_credentials',
          accessTokenUrl: 'https://oauth.example.com/token',
          clientId: 'client-id',
          clientSecret: 'client-secret',
        },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(true);
    });

    it('should reject OAuth2 without access token URL', () => {
      const auth: AuthConfig = {
        type: 'oauth2',
        oauth2: {
          grantType: 'client_credentials',
          accessTokenUrl: '',
          clientId: 'client-id',
          clientSecret: 'client-secret',
        },
      };

      const result = validateAuth(auth);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('access token URL');
    });
  });
});
