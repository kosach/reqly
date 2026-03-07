# Reqly MCP Server

Model Context Protocol (MCP) server for Reqly - AI-first API testing tool.

## Features

The Reqly MCP server provides 4 core tools for AI assistants to interact with Reqly:

### 1. createCollection
Create a new API collection with optional variables and authentication.

**Parameters:**
- `name` (required): Collection name
- `description` (optional): Collection description
- `variables` (optional): Array of collection-level variables
- `auth` (optional): Collection-level authentication config

**Example:**
```json
{
  "name": "My API",
  "description": "API endpoints for my service",
  "variables": [
    { "key": "baseUrl", "value": "https://api.example.com", "type": "default" },
    { "key": "apiKey", "value": "secret-key", "type": "secret" }
  ],
  "auth": {
    "type": "bearer",
    "bearer": { "token": "{{apiKey}}" }
  }
}
```

### 2. createRequest
Add an HTTP request to a collection.

**Parameters:**
- `collectionId` (required): ID of the collection
- `name` (required): Request name
- `method` (required): HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- `url` (required): Request URL (supports variable interpolation with `{{variable}}`)
- `headers` (optional): HTTP headers
- `body` (optional): Request body

**Example:**
```json
{
  "collectionId": "abc-123",
  "name": "Get User",
  "method": "GET",
  "url": "{{baseUrl}}/users/{{userId}}",
  "headers": {
    "Authorization": "Bearer {{apiKey}}"
  }
}
```

### 3. sendRequest
Execute an HTTP request and return the response with test results.

**Parameters:**
- `requestId` (required): ID of the request to execute
- `environmentId` (optional): Environment ID for variable values

**Response:**
- `success`: Whether the request succeeded
- `response`: HTTP response (status, headers, body, time, size)
- `logs`: Execution logs
- `tests`: Test results (if test script was attached)

**Example:**
```json
{
  "requestId": "req-456",
  "environmentId": "env-789"
}
```

### 4. writeTest
Add test assertions to a request.

**Parameters:**
- `requestId` (required): ID of the request
- `testScript` (required): Test script using Postman test syntax

**Example:**
```json
{
  "requestId": "req-456",
  "testScript": "pm.test('Status is 200', () => { pm.response.to.have.status(200); });"
}
```

## Installation

### Local Development
```bash
# Build the server
pnpm build

# Run the server
node dist/index.js
```

### MCP Client Configuration

Add to your MCP client config (e.g., Claude Desktop, Cline):

```json
{
  "mcpServers": {
    "reqly": {
      "command": "node",
      "args": ["/path/to/reqly/packages/mcp-server/dist/index.js"]
    }
  }
}
```

Or use the published npm package (once published):

```json
{
  "mcpServers": {
    "reqly": {
      "command": "npx",
      "args": ["@reqly/mcp-server"]
    }
  }
}
```

## Environment Variables

- `REQLY_DB_PATH`: Path to SQLite database (default: `~/.reqly/reqly.db`)

## Testing

```bash
# Run E2E tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run manual integration test
./test-mcp-manual.sh
```

## Integration

The MCP server integrates with:

- **@reqly/database**: SQLite persistence layer for collections, requests, and environments
- **@reqly/http-engine**: HTTP client with variable interpolation and scripting support

## Architecture

```
MCP Client (Claude, etc.)
    ↓ (stdio)
MCP Server (index.ts)
    ↓
Tools (createCollection, createRequest, sendRequest, writeTest)
    ↓
ReqlyDatabase ← → HTTP Engine
    ↓               ↓
SQLite          axios + scripts
```

## Development

```bash
# Watch mode
pnpm dev

# Type checking
pnpm typecheck

# Build
pnpm build
```

## License

MIT
