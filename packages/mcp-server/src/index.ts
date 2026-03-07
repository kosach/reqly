#!/usr/bin/env node

/**
 * Reqly MCP Server
 * 
 * Provides MCP tools for AI-first API testing:
 * - createCollection: Create a new collection with variables and auth
 * - createRequest: Add HTTP request to a collection
 * - sendRequest: Execute HTTP request and return response + test results
 * - writeTest: Add test assertions to a request
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ReqlyDatabase } from '@reqly/database';
import * as path from 'path';
import * as os from 'os';

// Import tool handlers
import { createCollection, createCollectionTool } from './tools/createCollection';
import { createRequest, createRequestTool } from './tools/createRequest';
import { sendRequest, sendRequestTool } from './tools/sendRequest';
import { writeTest, writeTestTool } from './tools/writeTest';

// Initialize database
const dbPath = process.env.REQLY_DB_PATH || path.join(os.homedir(), '.reqly', 'reqly.db');
const db = new ReqlyDatabase(dbPath);

console.error(`🗄️  Database initialized: ${dbPath}`);

async function main() {
  console.error('🚀 Starting Reqly MCP Server...');

  const server = new Server(
    {
      name: 'reqly-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        createCollectionTool,
        createRequestTool,
        sendRequestTool,
        writeTestTool,
      ],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'createCollection': {
          const result = await createCollection(db, args as any);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'createRequest': {
          const result = await createRequest(db, args as any);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'sendRequest': {
          const result = await sendRequest(db, args as any);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'writeTest': {
          const result = await writeTest(db, args as any);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
        isError: true,
      };
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.error('\n🛑 Shutting down...');
    db.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.error('\n🛑 Shutting down...');
    db.close();
    process.exit(0);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✅ Reqly MCP Server ready');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
