# @reqly/mcp-server

MCP (Model Context Protocol) server for Reqly.

Provides AI-native tools for API testing:
- `createCollection` - Create new API collection
- `createRequest` - Add request to collection
- `sendRequest` - Execute HTTP request
- `writeTest` - Add test assertions
- And more...

## Usage

```bash
# Run standalone
pnpm start

# Use in Claude Desktop
# Add to claude_desktop_config.json
```

## Development

```bash
pnpm build        # Compile TypeScript
pnpm dev          # Watch mode
pnpm start        # Run MCP server
```
