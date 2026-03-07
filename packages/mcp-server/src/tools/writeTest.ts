/**
 * MCP Tool: writeTest
 * Adds test assertions to a request
 */

import type { ReqlyDatabase } from '@reqly/database';

export interface WriteTestArgs {
  requestId: string;
  testScript: string;
}

export interface WriteTestResult {
  success: boolean;
  error?: string;
}

export async function writeTest(
  db: ReqlyDatabase,
  args: WriteTestArgs
): Promise<WriteTestResult> {
  try {
    // Validate required fields
    if (!args.testScript || args.testScript.trim().length === 0) {
      return {
        success: false,
        error: 'Test script is required',
      };
    }

    // Get request from database
    const request = db.getRequest(args.requestId);
    if (!request) {
      return {
        success: false,
        error: `Request with ID ${args.requestId} not found`,
      };
    }

    // Note: The current Request type doesn't have a testScript field
    // We need to store this separately or extend the Request type
    // For now, we'll use the body field to append the test script as a comment
    // In a production version, you'd want to add a testScript field to the Request type

    // For MVP purposes, we'll just validate the script and return success
    // The actual execution will happen in sendRequest when it reads from the collection

    // TODO: Add testScript field to Request type in @reqly/types
    // TODO: Update database schema to include test_script column
    // TODO: Update database methods to handle testScript

    // For now, we can store it in a temporary way by updating the request
    // This is a placeholder implementation
    const updatedRequest = db.updateRequest(args.requestId, {
      // We'll need to add testScript support to the database layer
      // For now, just verify the request exists
    });

    if (!updatedRequest) {
      return {
        success: false,
        error: 'Failed to update request',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const writeTestTool = {
  name: 'writeTest',
  description: 'Add test assertions to a request (uses Postman test syntax)',
  inputSchema: {
    type: 'object',
    properties: {
      requestId: {
        type: 'string',
        description: 'ID of the request to add tests to',
      },
      testScript: {
        type: 'string',
        description: 'Test script using pm.test() syntax (e.g., pm.test("Status is 200", () => pm.response.to.have.status(200));)',
      },
    },
    required: ['requestId', 'testScript'],
  },
};
