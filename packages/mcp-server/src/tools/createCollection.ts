/**
 * MCP Tool: createCollection
 * Creates a new collection with optional variables and auth config
 */

import type { ReqlyDatabase } from '@reqly/database';
import type { Variable, AuthConfig } from '@reqly/types';

export interface CreateCollectionArgs {
  name: string;
  description?: string;
  variables?: Variable[];
  auth?: AuthConfig;
}

export interface CreateCollectionResult {
  success: boolean;
  collectionId?: string;
  error?: string;
}

export async function createCollection(
  db: ReqlyDatabase,
  args: CreateCollectionArgs
): Promise<CreateCollectionResult> {
  try {
    // Validate required fields
    if (!args.name || args.name.trim().length === 0) {
      return {
        success: false,
        error: 'Collection name is required',
      };
    }

    // Create collection in database
    const collection = db.createCollection({
      name: args.name.trim(),
      description: args.description?.trim(),
      variables: args.variables,
      auth: args.auth,
    });

    return {
      success: true,
      collectionId: collection.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const createCollectionTool = {
  name: 'createCollection',
  description: 'Create a new API collection with optional variables and authentication config',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the collection',
      },
      description: {
        type: 'string',
        description: 'Optional description of the collection',
      },
      variables: {
        type: 'array',
        description: 'Collection-level variables',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            value: { type: 'string' },
            type: { type: 'string', enum: ['default', 'secret'] },
          },
          required: ['key', 'value', 'type'],
        },
      },
      auth: {
        type: 'object',
        description: 'Collection-level authentication config',
        properties: {
          type: {
            type: 'string',
            enum: ['none', 'bearer', 'basic', 'api-key', 'oauth2'],
          },
          bearer: {
            type: 'object',
            properties: { token: { type: 'string' } },
          },
          basic: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              password: { type: 'string' },
            },
          },
          apiKey: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
              in: { type: 'string', enum: ['header', 'query'] },
            },
          },
        },
        required: ['type'],
      },
    },
    required: ['name'],
  },
};
