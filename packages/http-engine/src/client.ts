/**
 * HTTP client for Reqly
 * Handles HTTP requests with variable interpolation, pre-request scripts, and logging
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Request, Response, Environment, Variable, AuthConfig } from '@reqly/types';
import { interpolateVariables } from './variables';
import { executePreRequestScript } from './scripts';

export interface RequestContext {
  request: Request;
  environment?: Environment;
  collectionVariables?: Variable[];
  preRequestScript?: string;
  testScript?: string;
}

export interface RequestResult {
  response: Response;
  logs: string[];
  scriptOutput?: {
    preRequest?: Record<string, unknown>;
    test?: TestResult[];
  };
  error?: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export class HTTPClient {
  private timeout: number;
  private maxRedirects: number;
  private validateStatus: (status: number) => boolean;

  constructor(options?: {
    timeout?: number;
    maxRedirects?: number;
    validateStatus?: (status: number) => boolean;
  }) {
    this.timeout = options?.timeout ?? 30000; // 30 seconds default
    this.maxRedirects = options?.maxRedirects ?? 5;
    this.validateStatus = options?.validateStatus ?? (() => true); // Accept all status codes
  }

  /**
   * Send an HTTP request with full context (variables, scripts, etc.)
   */
  async sendRequest(context: RequestContext): Promise<RequestResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(`[${new Date().toISOString()}] Starting request: ${context.request.method} ${context.request.url}`);

      // Build environment from all sources
      const variables = this.buildVariableMap(
        context.environment?.variables,
        context.collectionVariables
      );

      logs.push(`[${new Date().toISOString()}] Environment variables: ${Object.keys(variables).length} variables loaded`);

      // Execute pre-request script
      let scriptEnvironment = { ...variables };
      if (context.preRequestScript) {
        logs.push(`[${new Date().toISOString()}] Executing pre-request script`);
        const scriptResult = await executePreRequestScript(
          context.preRequestScript,
          scriptEnvironment
        );
        scriptEnvironment = { ...scriptEnvironment, ...scriptResult.environment };
        logs.push(...scriptResult.logs);
      }

      // Interpolate variables in URL, headers, and body
      const interpolatedUrl = interpolateVariables(context.request.url, scriptEnvironment);
      const interpolatedHeaders = this.interpolateHeaders(
        context.request.headers,
        scriptEnvironment
      );
      const interpolatedBody = context.request.body
        ? interpolateVariables(context.request.body, scriptEnvironment)
        : undefined;

      logs.push(`[${new Date().toISOString()}] Interpolated URL: ${interpolatedUrl}`);

      // Build axios request config
      const axiosConfig: AxiosRequestConfig = {
        method: context.request.method,
        url: interpolatedUrl,
        headers: interpolatedHeaders,
        data: interpolatedBody,
        timeout: this.timeout,
        maxRedirects: this.maxRedirects,
        validateStatus: this.validateStatus,
        // Disable automatic decompression to get accurate size
        decompress: false,
      };

      logs.push(`[${new Date().toISOString()}] Sending request...`);

      // Send request
      const axiosResponse = await axios.request(axiosConfig);
      const responseTime = Date.now() - startTime;

      logs.push(`[${new Date().toISOString()}] Response received: ${axiosResponse.status} ${axiosResponse.statusText} (${responseTime}ms)`);

      // Build response object
      const response: Response = {
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
        headers: this.normalizeHeaders(axiosResponse.headers),
        body: this.serializeResponseBody(axiosResponse.data),
        time: responseTime,
        size: this.calculateResponseSize(axiosResponse),
      };

      logs.push(`[${new Date().toISOString()}] Response size: ${response.size} bytes`);

      return {
        response,
        logs,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logs.push(`[${new Date().toISOString()}] Request failed after ${responseTime}ms`);

      if (axios.isAxiosError(error)) {
        return this.handleAxiosError(error, logs, responseTime);
      }

      logs.push(`[${new Date().toISOString()}] Unexpected error: ${error instanceof Error ? error.message : String(error)}`);

      return {
        response: {
          status: 0,
          statusText: 'Request Failed',
          headers: {},
          body: '',
          time: responseTime,
          size: 0,
        },
        logs,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Simple request method without scripts or variables
   */
  async request(
    method: Request['method'],
    url: string,
    options?: {
      headers?: Record<string, string>;
      body?: string;
      timeout?: number;
    }
  ): Promise<Response> {
    const context: RequestContext = {
      request: {
        id: 'temp',
        name: 'Temporary Request',
        method,
        url,
        headers: options?.headers ?? {},
        body: options?.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const result = await this.sendRequest(context);

    if (result.error) {
      throw new Error(result.error);
    }

    return result.response;
  }

  // Convenience methods
  async get(url: string, headers?: Record<string, string>): Promise<Response> {
    return this.request('GET', url, { headers });
  }

  async post(url: string, body?: string, headers?: Record<string, string>): Promise<Response> {
    return this.request('POST', url, { body, headers });
  }

  async put(url: string, body?: string, headers?: Record<string, string>): Promise<Response> {
    return this.request('PUT', url, { body, headers });
  }

  async delete(url: string, headers?: Record<string, string>): Promise<Response> {
    return this.request('DELETE', url, { headers });
  }

  async patch(url: string, body?: string, headers?: Record<string, string>): Promise<Response> {
    return this.request('PATCH', url, { body, headers });
  }

  // Private helper methods

  private buildVariableMap(
    environmentVars?: Variable[],
    collectionVars?: Variable[]
  ): Record<string, string> {
    const variables: Record<string, string> = {};

    // Collection variables first (lower priority)
    if (collectionVars) {
      for (const v of collectionVars) {
        variables[v.key] = v.value;
      }
    }

    // Environment variables override collection variables
    if (environmentVars) {
      for (const v of environmentVars) {
        variables[v.key] = v.value;
      }
    }

    return variables;
  }

  private interpolateHeaders(
    headers: Record<string, string>,
    variables: Record<string, string>
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      result[key] = interpolateVariables(value, variables);
    }

    return result;
  }

  private normalizeHeaders(headers: AxiosResponse['headers']): Record<string, string> {
    const normalized: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        normalized[key] = value;
      } else if (Array.isArray(value)) {
        normalized[key] = value.join(', ');
      } else if (value !== undefined) {
        normalized[key] = String(value);
      }
    }

    return normalized;
  }

  private serializeResponseBody(data: unknown): string {
    if (typeof data === 'string') {
      return data;
    }

    if (data === null || data === undefined) {
      return '';
    }

    // For objects/arrays, serialize as JSON
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  private calculateResponseSize(response: AxiosResponse): number {
    // Try to get size from Content-Length header
    const contentLength = response.headers['content-length'];
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (!isNaN(size)) {
        return size;
      }
    }

    // Fallback: calculate from body
    const bodyString = this.serializeResponseBody(response.data);
    return Buffer.byteLength(bodyString, 'utf8');
  }

  private handleAxiosError(
    error: AxiosError,
    logs: string[],
    responseTime: number
  ): RequestResult {
    if (error.response) {
      // Server responded with error status
      logs.push(`[${new Date().toISOString()}] Server error: ${error.response.status} ${error.response.statusText}`);

      return {
        response: {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: this.normalizeHeaders(error.response.headers),
          body: this.serializeResponseBody(error.response.data),
          time: responseTime,
          size: this.calculateResponseSize(error.response),
        },
        logs,
      };
    }

    if (error.request) {
      // Request was made but no response received
      logs.push(`[${new Date().toISOString()}] Network error: ${error.message}`);

      return {
        response: {
          status: 0,
          statusText: 'Network Error',
          headers: {},
          body: '',
          time: responseTime,
          size: 0,
        },
        logs,
        error: `Network error: ${error.message}`,
      };
    }

    // Request setup failed
    logs.push(`[${new Date().toISOString()}] Request setup error: ${error.message}`);

    return {
      response: {
        status: 0,
        statusText: 'Request Failed',
        headers: {},
        body: '',
        time: responseTime,
        size: 0,
      },
      logs,
      error: error.message,
    };
  }
}

// Export default instance
export const httpClient = new HTTPClient();
