/**
 * Authentication handling for HTTP requests
 */

import type { AuthConfig } from '@reqly/types';

/**
 * Apply authentication to request headers
 * @param headers - Existing request headers
 * @param auth - Authentication configuration
 * @returns Headers with authentication applied
 */
export function applyAuth(
  headers: Record<string, string>,
  auth?: AuthConfig
): Record<string, string> {
  if (!auth || auth.type === 'none') {
    return headers;
  }

  const result = { ...headers };

  switch (auth.type) {
    case 'bearer':
      if (auth.bearer?.token) {
        result['Authorization'] = `Bearer ${auth.bearer.token}`;
      }
      break;

    case 'basic':
      if (auth.basic?.username && auth.basic?.password) {
        const credentials = Buffer.from(
          `${auth.basic.username}:${auth.basic.password}`
        ).toString('base64');
        result['Authorization'] = `Basic ${credentials}`;
      }
      break;

    case 'api-key':
      if (auth.apiKey?.key && auth.apiKey?.value) {
        if (auth.apiKey.in === 'header') {
          result[auth.apiKey.key] = auth.apiKey.value;
        }
        // Query params are handled separately in URL building
      }
      break;

    case 'oauth2':
      // OAuth2 is handled via pre-request scripts or environment variables
      // The access token should be set in environment and used with bearer
      break;
  }

  return result;
}

/**
 * Apply API key authentication to URL query parameters
 * @param url - Original URL
 * @param auth - Authentication configuration
 * @returns URL with API key added if applicable
 */
export function applyAuthToUrl(url: string, auth?: AuthConfig): string {
  if (!auth || auth.type !== 'api-key' || auth.apiKey?.in !== 'query') {
    return url;
  }

  if (!auth.apiKey?.key || !auth.apiKey?.value) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set(auth.apiKey.key, auth.apiKey.value);
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Validate authentication configuration
 * @param auth - Authentication configuration
 * @returns Validation result with error message if invalid
 */
export function validateAuth(auth: AuthConfig): { valid: boolean; error?: string } {
  switch (auth.type) {
    case 'none':
      return { valid: true };

    case 'bearer':
      if (!auth.bearer?.token) {
        return { valid: false, error: 'Bearer token is required' };
      }
      return { valid: true };

    case 'basic':
      if (!auth.basic?.username) {
        return { valid: false, error: 'Basic auth username is required' };
      }
      if (!auth.basic?.password) {
        return { valid: false, error: 'Basic auth password is required' };
      }
      return { valid: true };

    case 'api-key':
      if (!auth.apiKey?.key) {
        return { valid: false, error: 'API key name is required' };
      }
      if (!auth.apiKey?.value) {
        return { valid: false, error: 'API key value is required' };
      }
      if (!auth.apiKey?.in) {
        return { valid: false, error: 'API key location (header/query) is required' };
      }
      return { valid: true };

    case 'oauth2':
      if (!auth.oauth2?.accessTokenUrl) {
        return { valid: false, error: 'OAuth2 access token URL is required' };
      }
      if (!auth.oauth2?.clientId) {
        return { valid: false, error: 'OAuth2 client ID is required' };
      }
      if (!auth.oauth2?.clientSecret) {
        return { valid: false, error: 'OAuth2 client secret is required' };
      }
      return { valid: true };

    default:
      return { valid: false, error: 'Unknown authentication type' };
  }
}
