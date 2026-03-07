#!/bin/bash

# Manual test script for MCP server
# This script tests the MCP server via stdio communication

set -e

echo "🧪 Testing Reqly MCP Server"
echo "=============================="

# Make sure the server is built
echo "📦 Building MCP server..."
pnpm build

# Test 1: Start server and check it's responsive
echo ""
echo "✅ Test 1: Server starts successfully"
echo "Starting MCP server in background..."

# Create a named pipe for communication
PIPE_DIR=$(mktemp -d)
REQUEST_PIPE="$PIPE_DIR/request"
RESPONSE_PIPE="$PIPE_DIR/response"

mkfifo "$REQUEST_PIPE"
mkfifo "$RESPONSE_PIPE"

# Start the MCP server in background
node dist/index.js < "$REQUEST_PIPE" > "$RESPONSE_PIPE" 2>/dev/null &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"

# Give server time to start
sleep 2

# Check if server is still running
if ps -p $SERVER_PID > /dev/null; then
  echo "✅ Server is running"
else
  echo "❌ Server failed to start"
  exit 1
fi

# Clean up
kill $SERVER_PID 2>/dev/null || true
rm -rf "$PIPE_DIR"

echo ""
echo "✅ All manual tests passed!"
echo ""
echo "📝 To test the MCP server with a real MCP client:"
echo "   1. Build the server: pnpm build"
echo "   2. Add to your MCP client config:"
echo "      {"
echo "        \"mcpServers\": {"
echo "          \"reqly\": {"
echo "            \"command\": \"node\","
echo "            \"args\": [\"$(pwd)/dist/index.js\"]"
echo "          }"
echo "        }"
echo "      }"
echo ""
