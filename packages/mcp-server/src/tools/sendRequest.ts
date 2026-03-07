/**
 * MCP Tool: sendRequest
 * Executes an HTTP request and returns response with test results
 */

import type { ReqlyDatabase } from '@reqly/database';
import { httpClient } from '@reqly/http-engine';
import type { RequestContext, RequestResult as EngineRequestResult } from '@reqly/http-engine';

export interface SendRequestArgs {
  requestId: string;
  environmentId?: string;
}

export interface SendRequestResult {
  success: boolean;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
    size: number;
  };
  logs?: string[];
  tests?: Array<{
    name: string;
    passed: boolean;
    error?: string;
  }>;
  error?: string;
}

export async function sendRequest(
  db: ReqlyDatabase,
  args: SendRequestArgs
): Promise<SendRequestResult> {
  try {
    // Get request from database
    const request = db.getRequest(args.requestId);
    if (!request) {
      return {
        success: false,
        error: `Request with ID ${args.requestId} not found`,
      };
    }

    // Get collection for variables and auth
    let collection = null;
    let collectionVariables = undefined;
    let collectionAuth = undefined;

    if (request.collectionId) {
      collection = db.getCollection(request.collectionId);
      if (collection) {
        collectionVariables = collection.variables;
        collectionAuth = collection.auth;
      }
    }

    // Get environment if specified
    let environment = undefined;
    if (args.environmentId) {
      const env = db.getEnvironment(args.environmentId);
      if (!env) {
        return {
          success: false,
          error: `Environment with ID ${args.environmentId} not found`,
        };
      }
      environment = env;
    }

    // Build request context
    const context: RequestContext = {
      request,
      environment,
      collectionVariables,
      collectionAuth,
    };

    // Execute request using HTTP engine
    const result: EngineRequestResult = await httpClient.sendRequest(context);

    // Check if there was an error
    if (result.error) {
      return {
        success: false,
        error: result.error,
        logs: result.logs,
      };
    }

    // Return success response
    return {
      success: true,
      response: {
        status: result.response.status,
        statusText: result.response.statusText,
        headers: result.response.headers,
        body: result.response.body,
        time: result.response.time,
        size: result.response.size,
      },
      logs: result.logs,
      tests: result.scriptOutput?.test,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const sendRequestTool = {
  name: 'sendRequest',
  description: 'Execute an HTTP request and return the response with test results',
  inputSchema: {
    type: 'object',
    properties: {
      requestId: {
        type: 'string',
        description: 'ID of the request to execute',
      },
      environmentId: {
        type: 'string',
        description: 'Optional environment ID for variable values',
      },
    },
    required: ['requestId'],
  },
};
