/**
 * MCP Tool: createRequest
 * Creates a new HTTP request within a collection
 */

import type { ReqlyDatabase } from '@reqly/database';

export interface CreateRequestArgs {
  collectionId: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface CreateRequestResult {
  success: boolean;
  requestId?: string;
  error?: string;
}

export async function createRequest(
  db: ReqlyDatabase,
  args: CreateRequestArgs
): Promise<CreateRequestResult> {
  try {
    // Validate required fields
    if (!args.name || args.name.trim().length === 0) {
      return {
        success: false,
        error: 'Request name is required',
      };
    }

    if (!args.url || args.url.trim().length === 0) {
      return {
        success: false,
        error: 'Request URL is required',
      };
    }

    // Validate collection exists
    const collection = db.getCollection(args.collectionId);
    if (!collection) {
      return {
        success: false,
        error: `Collection with ID ${args.collectionId} not found`,
      };
    }

    // Create request in database
    const request = db.createRequest({
      name: args.name.trim(),
      method: args.method,
      url: args.url.trim(),
      headers: args.headers || {},
      body: args.body,
      collectionId: args.collectionId,
    });

    return {
      success: true,
      requestId: request.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const createRequestTool = {
  name: 'createRequest',
  description: 'Create a new HTTP request within a collection',
  inputSchema: {
    type: 'object',
    properties: {
      collectionId: {
        type: 'string',
        description: 'ID of the collection to add the request to',
      },
      name: {
        type: 'string',
        description: 'Name of the request',
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
        description: 'HTTP method',
      },
      url: {
        type: 'string',
        description: 'Request URL (supports variable interpolation with {{variable}})',
      },
      headers: {
        type: 'object',
        description: 'HTTP headers (key-value pairs)',
        additionalProperties: { type: 'string' },
      },
      body: {
        type: 'string',
        description: 'Request body (for POST, PUT, PATCH)',
      },
    },
    required: ['collectionId', 'name', 'method', 'url'],
  },
};
