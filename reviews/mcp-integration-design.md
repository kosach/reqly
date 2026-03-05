# MCP Integration Design

## Overview

MCP (Model Context Protocol) will serve as the **PRIMARY interface** for this AI-first API testing tool. Rather than treating AI as an add-on to a traditional GUI, we're inverting the paradigm: MCP tools, resources, and prompts ARE the product interface, with any UI serving as a visualization layer.

This design enables:
- **AI agents as first-class users** - Claude, GPT-4, and other LLMs can directly create, test, and debug APIs
- **Conversational API testing** - "Test the auth endpoint with invalid tokens" instead of clicking through UIs
- **Intelligent automation** - AI can analyze responses, suggest tests, and iterate on failures
- **Seamless integration** - Works in any MCP-compatible environment (Claude Desktop, IDEs, custom agents)

### Core Philosophy

1. **Tools are actions** - Every operation an AI might want to perform
2. **Resources are context** - Structured data AI can read to understand state
3. **Prompts are workflows** - Common patterns packaged as reusable templates
4. **Security is non-negotiable** - OAuth 2.1, scoped permissions, audit logs
5. **Performance at scale** - Design for 1000+ collections, 10K+ requests

---

## Tools

Tools are the executable functions AI agents can invoke. Each tool should be:
- **Atomic** - Does one thing well
- **Idempotent** where possible
- **Well-validated** - Clear error messages
- **Fast** - Sub-second response for non-network operations

### Collection Management

#### `createCollection`
Create a new API collection.

**Arguments:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "baseUrl": "string (optional)",
  "auth": {
    "type": "none|apikey|bearer|oauth2|basic",
    "config": "object (type-specific)"
  }
}
```

**Returns:**
```json
{
  "id": "uuid",
  "name": "string",
  "createdAt": "ISO8601",
  "resourceUri": "collection://uuid"
}
```

**Example:**
```
AI: "Create a collection called 'GitHub API' with base URL https://api.github.com"
→ createCollection(name="GitHub API", baseUrl="https://api.github.com")
```

#### `listCollections`
List all collections with optional filtering.

**Arguments:**
```json
{
  "filter": "string (optional, fuzzy search)",
  "limit": "number (default: 50, max: 200)",
  "offset": "number (default: 0)",
  "sortBy": "name|createdAt|lastUsed (default: lastUsed)"
}
```

**Returns:**
```json
{
  "collections": [
    {
      "id": "uuid",
      "name": "string",
      "requestCount": "number",
      "lastUsed": "ISO8601"
    }
  ],
  "total": "number",
  "hasMore": "boolean"
}
```

#### `deleteCollection`
Delete a collection and all its requests.

**Arguments:**
```json
{
  "collectionId": "uuid",
  "confirm": "boolean (must be true)"
}
```

**Returns:**
```json
{
  "success": "boolean",
  "deletedRequests": "number"
}
```

---

### Request Operations

#### `createRequest`
Add a new request to a collection.

**Arguments:**
```json
{
  "collectionId": "uuid",
  "name": "string",
  "method": "GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS",
  "url": "string (can use {{variables}})",
  "headers": {
    "key": "value"
  },
  "body": {
    "type": "json|form|raw|binary",
    "content": "string|object"
  },
  "tests": [
    {
      "name": "string",
      "assertion": "status == 200|body.id != null|responseTime < 1000"
    }
  ]
}
```

**Returns:**
```json
{
  "id": "uuid",
  "resourceUri": "request://uuid"
}
```

**Example:**
```
AI: "Add a GET request to fetch user profile at /user"
→ createRequest(
    collectionId="github-uuid",
    name="Get User",
    method="GET",
    url="/user",
    headers={"Accept": "application/json"}
  )
```

#### `sendRequest`
Execute a request and return the response.

**Arguments:**
```json
{
  "requestId": "uuid (from createRequest)",
  "environment": "string (optional, environment name)",
  "variables": {
    "key": "value (runtime overrides)"
  },
  "followRedirects": "boolean (default: true)",
  "timeout": "number (ms, default: 30000)"
}
```

**Returns:**
```json
{
  "runId": "uuid",
  "status": "number",
  "statusText": "string",
  "headers": {"key": "value"},
  "body": "string|object (parsed if JSON)",
  "responseTime": "number (ms)",
  "size": "number (bytes)",
  "timestamp": "ISO8601",
  "testResults": {
    "passed": "number",
    "failed": "number",
    "tests": [
      {
        "name": "string",
        "passed": "boolean",
        "message": "string (if failed)"
      }
    ]
  }
}
```

**Example:**
```
AI: "Send the 'Get User' request"
→ sendRequest(requestId="user-req-uuid")
```

#### `updateRequest`
Modify an existing request.

**Arguments:**
```json
{
  "requestId": "uuid",
  "updates": {
    "name": "string (optional)",
    "url": "string (optional)",
    "headers": "object (optional, merges)",
    "body": "object (optional)",
    "tests": "array (optional, replaces)"
  }
}
```

#### `runTests`
Execute tests against a request without saving the response.

**Arguments:**
```json
{
  "requestId": "uuid",
  "environment": "string (optional)"
}
```

**Returns:** Same as `sendRequest` but focused on test results.

---

### Environment Management

#### `createEnvironment`
Create a new environment for variable management.

**Arguments:**
```json
{
  "name": "string (e.g., 'production', 'staging')",
  "variables": {
    "key": "value"
  },
  "isSecure": "boolean (if true, values are encrypted)"
}
```

**Returns:**
```json
{
  "id": "uuid",
  "name": "string",
  "resourceUri": "environment://name"
}
```

#### `setVariable`
Set a variable in an environment.

**Arguments:**
```json
{
  "environment": "string (environment name)",
  "key": "string",
  "value": "string",
  "isSecret": "boolean (default: false)"
}
```

**Returns:**
```json
{
  "success": "boolean"
}
```

**Example:**
```
AI: "Set the API_KEY variable in production to sk_live_xyz"
→ setVariable(environment="production", key="API_KEY", value="sk_live_xyz", isSecret=true)
```

#### `getVariable`
Retrieve a variable value (non-secret only via MCP).

**Arguments:**
```json
{
  "environment": "string",
  "key": "string"
}
```

**Returns:**
```json
{
  "key": "string",
  "value": "string",
  "isSecret": "boolean"
}
```

---

### Testing & Validation

#### `generateTests`
AI-assisted test generation based on OpenAPI spec or request pattern.

**Arguments:**
```json
{
  "requestId": "uuid (optional)",
  "openApiSpec": "string|object (optional)",
  "testTypes": ["status", "schema", "performance", "security"]
}
```

**Returns:**
```json
{
  "suggestedTests": [
    {
      "name": "string",
      "assertion": "string",
      "rationale": "string (why this test matters)"
    }
  ]
}
```

**Example:**
```
AI: "Generate tests for the login endpoint"
→ generateTests(requestId="login-uuid", testTypes=["status", "security"])
```

#### `runCollection`
Execute all requests in a collection sequentially.

**Arguments:**
```json
{
  "collectionId": "uuid",
  "environment": "string (optional)",
  "stopOnFailure": "boolean (default: false)",
  "parallel": "boolean (default: false)"
}
```

**Returns:**
```json
{
  "runId": "uuid",
  "totalRequests": "number",
  "passed": "number",
  "failed": "number",
  "duration": "number (ms)",
  "results": [
    {
      "requestId": "uuid",
      "requestName": "string",
      "status": "success|failure|skipped",
      "testResults": "object"
    }
  ]
}
```

---

### Import/Export

#### `importCollection`
Import from Postman, OpenAPI, Insomnia, etc.

**Arguments:**
```json
{
  "format": "postman|openapi|insomnia|curl",
  "data": "string|object",
  "collectionName": "string (optional, inferred if not provided)"
}
```

**Returns:**
```json
{
  "collectionId": "uuid",
  "importedRequests": "number",
  "warnings": ["string (non-fatal issues)"]
}
```

**Example:**
```
AI: "Import this OpenAPI spec: https://api.stripe.com/v1/openapi.yaml"
→ importCollection(format="openapi", data="<fetched YAML>")
```

#### `exportCollection`
Export a collection to various formats.

**Arguments:**
```json
{
  "collectionId": "uuid",
  "format": "postman|openapi|insomnia|markdown|code",
  "codeLanguage": "curl|python|javascript|go (if format=code)"
}
```

**Returns:**
```json
{
  "data": "string (serialized export)",
  "format": "string"
}
```

---

## Resources

Resources provide **read-only contextual data** that AI agents can fetch to understand the current state. They use URI-based addressing and support templates for scalability.

### Collections Resource

**URI Pattern:** `collections://`

**Description:** List of all available collections (lightweight metadata only).

**Schema:**
```json
{
  "collections": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "requestCount": "number",
      "lastUsed": "ISO8601",
      "uri": "collection://{id}"
    }
  ]
}
```

**Usage:**
- AI reads this to discover available collections
- Returns metadata only (not full request details)
- Supports pagination via `?limit=50&offset=0`

---

### Collection Detail Resource

**URI Pattern:** `collection://{id}`

**Description:** Full details of a specific collection.

**Schema:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "baseUrl": "string",
  "auth": "object",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "requests": [
    {
      "id": "uuid",
      "name": "string",
      "method": "string",
      "url": "string",
      "uri": "request://{id}"
    }
  ],
  "environments": ["string (names)"],
  "tags": ["string"]
}
```

**Usage:**
- AI reads to understand collection structure
- Includes request list for navigation
- Does NOT include full request bodies (use request resource for that)

---

### Request Resource

**URI Pattern:** `request://{id}`

**Description:** Complete request configuration.

**Schema:**
```json
{
  "id": "uuid",
  "collectionId": "uuid",
  "name": "string",
  "method": "string",
  "url": "string",
  "headers": {"key": "value"},
  "body": "object",
  "tests": [
    {
      "name": "string",
      "assertion": "string"
    }
  ],
  "documentation": "string (markdown)",
  "examples": [
    {
      "name": "string",
      "response": "object"
    }
  ]
}
```

**Usage:**
- AI reads before modifying a request
- Includes tests and documentation for context
- Can be passed to AI for analysis/suggestions

---

### Environment Resource

**URI Pattern:** `environment://{name}`

**Description:** Environment variables (non-secret values only).

**Schema:**
```json
{
  "name": "string",
  "variables": {
    "key": {
      "value": "string|null (null if secret)",
      "isSecret": "boolean"
    }
  },
  "createdAt": "ISO8601"
}
```

**Usage:**
- AI reads to understand available variables
- Secret values are masked (return null)
- Helps AI suggest variable usage in requests

---

### Test Results Resource

**URI Pattern:** `testResults://{runId}`

**Description:** Historical test run results.

**Schema:**
```json
{
  "runId": "uuid",
  "collectionId": "uuid",
  "timestamp": "ISO8601",
  "duration": "number",
  "summary": {
    "total": "number",
    "passed": "number",
    "failed": "number"
  },
  "results": [
    {
      "requestId": "uuid",
      "requestName": "string",
      "testResults": "object",
      "response": "object (truncated if large)"
    }
  ]
}
```

**Usage:**
- AI reads to analyze test failures
- Helps debug flaky tests
- Provides historical context

---

### Resource Template System

For scalability with 1000+ collections:

**Problem:** Returning all 1000 collections in a single resource is slow and wastes tokens.

**Solution:** Resource templates + pagination

```
collections://?limit=50&offset=0
collections://?filter=github
collection://{id}  ← AI fetches specific collections as needed
```

**Behavior:**
1. AI reads `collections://` → gets first 50 with hasMore=true
2. AI can filter: `collections://?filter=auth` → only auth-related
3. AI fetches detail: `collection://{id}` → full collection data
4. Never enumerate all collections in one call

---

## Prompts

Prompts are **reusable workflow templates** that guide AI through common tasks. They combine tools, resources, and best practices.

### Prompt: Debug API Endpoint

**Name:** `debug-api-endpoint`

**Description:** Investigate why an API endpoint is failing.

**Template:**
```
You are helping debug an API endpoint that's returning errors.

Steps:
1. Read the request details from request://{requestId}
2. Check the environment variables used (environment://{envName})
3. Send the request with verbose logging: sendRequest(requestId="{requestId}")
4. Analyze the response:
   - Check status code and headers
   - Validate response body structure
   - Check response time
5. Suggest fixes based on:
   - Common error patterns (auth, rate limits, malformed requests)
   - Comparison with API documentation
   - Historical test results (if available)

Current request: {requestId}
Environment: {envName}
Error observed: {errorMessage}

Please investigate and provide actionable recommendations.
```

**Usage:**
```
User: "My login endpoint is returning 401"
AI: [Applies debug-api-endpoint prompt]
  → Reads request://login-uuid
  → Checks environment://staging
  → Sends request and analyzes response
  → Identifies missing Authorization header
```

---

### Prompt: Create Test Suite

**Name:** `create-test-suite`

**Description:** Generate comprehensive tests for a collection.

**Template:**
```
You are creating a test suite for an API collection.

Steps:
1. Read the collection structure: collection://{collectionId}
2. For each request, analyze:
   - Expected status codes
   - Response schema
   - Performance requirements
   - Security implications
3. Use generateTests() to create assertions for:
   - Status code validation
   - Response schema validation
   - Response time thresholds
   - Security headers (HTTPS, CORS, etc.)
4. Apply tests using updateRequest() for each endpoint
5. Run the full suite: runCollection(collectionId="{collectionId}")
6. Report coverage and suggest additional tests

Collection: {collectionId}
Focus areas: {testTypes}

Generate a comprehensive, maintainable test suite.
```

---

### Prompt: API Migration Assistant

**Name:** `migrate-api-version`

**Description:** Help migrate from one API version to another.

**Template:**
```
You are assisting with API version migration.

Steps:
1. Read old collection: collection://{oldCollectionId}
2. Import new API spec: importCollection(format="openapi", data="{newSpecUrl}")
3. Compare endpoints:
   - Identify deprecated endpoints
   - Find renamed endpoints
   - Detect new required fields
   - Check for breaking changes
4. Create migration checklist
5. Update requests with new patterns
6. Test both versions side-by-side
7. Generate migration report

Old collection: {oldCollectionId}
New API spec: {newSpecUrl}

Provide a step-by-step migration plan.
```

---

### Prompt: Monitor API Health

**Name:** `monitor-api-health`

**Description:** Continuous API health monitoring and alerting.

**Template:**
```
You are monitoring API health for a collection.

Steps:
1. Read collection: collection://{collectionId}
2. Run all requests: runCollection(collectionId="{collectionId}", environment="{envName}")
3. Analyze results:
   - Check for status code changes
   - Monitor response time trends
   - Detect schema drift
   - Identify rate limit issues
4. Compare with historical runs: testResults://{previousRunId}
5. Alert on:
   - New failures
   - Performance degradation (>20% slower)
   - Schema changes
6. Suggest remediations

Collection: {collectionId}
Environment: {envName}
Alert threshold: {threshold}

Report health status and any concerns.
```

---

## Security Model

Security is paramount when AI agents have direct access to API testing tools.

### Authentication

**OAuth 2.1 Flow:**

1. **User initiates MCP connection** in Claude Desktop/IDE
2. **OAuth redirect** to auth server
3. **User grants scopes:**
   - `collections:read` - View collections
   - `collections:write` - Create/modify collections
   - `requests:execute` - Send API requests
   - `environments:read` - View non-secret variables
   - `environments:write` - Modify variables
   - `admin:all` - Full access
4. **Token exchange** returns access token + refresh token
5. **MCP server validates token** on every tool call

**Token Security:**
- Access tokens: 1-hour expiry
- Refresh tokens: 30-day expiry, single-use
- Stored in OS keychain (not in MCP logs)
- Automatic refresh before expiry

---

### Scoped Permissions

Each tool requires specific scopes:

| Tool | Required Scope |
|------|----------------|
| `listCollections` | `collections:read` |
| `createCollection` | `collections:write` |
| `sendRequest` | `requests:execute` |
| `setVariable` | `environments:write` |
| `deleteCollection` | `collections:write` + `admin:delete` |

**Principle of Least Privilege:**
- AI agents request minimum scopes needed
- Users approve scope grants explicitly
- Scopes can be revoked anytime

---

### Sensitive Data Handling

**Secret Variables:**
- Encrypted at rest (AES-256)
- Never returned via MCP resources
- Only injected at request execution time
- Redacted in logs and test results

**Request Bodies:**
- PII detection (regex + ML)
- Auto-redact: emails, API keys, tokens, passwords
- User can mark fields as sensitive

**Response Logging:**
- Responses truncated to 10KB in MCP
- Full responses stored server-side (encrypted)
- Audit log of all AI actions

---

### Rate Limiting

**Per-User Limits:**
- 100 tool calls per minute
- 1000 requests executed per hour
- 50 collection runs per day

**Burst Allowance:**
- First 10 calls instant
- Then 100ms delay between calls
- Prevents accidental DOS from AI loops

**Error Handling:**
```json
{
  "error": "rate_limit_exceeded",
  "retryAfter": 60,
  "limit": 100,
  "remaining": 0
}
```

---

### Audit Trail

Every MCP tool call logged:

```json
{
  "timestamp": "ISO8601",
  "userId": "uuid",
  "sessionId": "uuid (MCP session)",
  "tool": "sendRequest",
  "arguments": {"requestId": "uuid"},
  "result": "success|failure",
  "ipAddress": "string",
  "userAgent": "Claude Desktop 1.0"
}
```

**Compliance:**
- Retention: 90 days
- Exportable for security review
- Anomaly detection (e.g., 100 deletes in 1 minute)

---

## Performance Considerations

### Handling 1000+ Collections

**Challenge:** AI shouldn't enumerate all collections on every interaction.

**Solutions:**

1. **Resource Templates:**
   - `collections://` returns metadata only (id, name, lastUsed)
   - AI fetches full detail via `collection://{id}` as needed
   - Pagination: `?limit=50&offset=0`

2. **Fuzzy Search:**
   - `listCollections(filter="github")` → fast substring matching
   - AI narrows down before fetching details

3. **Caching:**
   - Collection metadata cached 5 minutes
   - Invalidated on write operations
   - Reduces DB load by 90%

4. **Lazy Loading:**
   - Requests within collection not loaded until `collection://{id}` accessed
   - Tests/documentation loaded on-demand

---

### Request Execution Performance

**Challenge:** AI might send 100+ requests during debugging.

**Optimizations:**

1. **Connection Pooling:**
   - Reuse HTTP connections per domain
   - Reduces handshake overhead

2. **Parallel Execution:**
   - `runCollection(parallel=true)` → concurrent requests
   - Respects server rate limits

3. **Response Streaming:**
   - Large responses (>1MB) streamed
   - AI gets status + headers immediately
   - Body follows

4. **Selective Response Data:**
   - MCP returns truncated responses (10KB)
   - Full response available via `testResults://{runId}`
   - AI can request specific fields: `sendRequest(fields=["status", "headers.x-rate-limit"])`

---

### MCP Protocol Efficiency

**Challenge:** JSON-RPC overhead on every tool call.

**Optimizations:**

1. **Batch Operations:**
   - `batchSendRequests([id1, id2, id3])` → single MCP call
   - Reduces round trips by 90%

2. **Compression:**
   - gzip responses >1KB
   - Saves bandwidth on large collections

3. **Incremental Updates:**
   - Resources support ETags
   - AI can poll: `collection://{id}?ifNoneMatch={etag}`
   - Returns 304 Not Modified if unchanged

4. **Subscription Model (Future):**
   - AI subscribes to collection changes
   - Server pushes updates via MCP notifications
   - No polling needed

---

## Implementation Roadmap

### Phase 1: Core MCP Foundation (Weeks 1-3)

**Deliverables:**
- MCP server skeleton (TypeScript/Node.js)
- OAuth 2.1 authentication flow
- Basic tool implementations:
  - `createCollection`
  - `createRequest`
  - `sendRequest`
  - `listCollections`
- Basic resources:
  - `collections://`
  - `collection://{id}`
  - `request://{id}`
- Database schema (PostgreSQL)
- Unit tests (80% coverage)

**Success Criteria:**
- AI can create a collection, add a request, and send it
- OAuth flow works in Claude Desktop
- Response time <200ms for tool calls (non-network)

---

### Phase 2: Environment & Testing (Weeks 4-6)

**Deliverables:**
- Environment management tools:
  - `createEnvironment`
  - `setVariable`
  - `getVariable`
- Variable interpolation in requests (`{{VAR}}`)
- Test assertions engine
- `runTests` and `runCollection` tools
- Test results resource: `testResults://{runId}`
- Secret encryption (AES-256)

**Success Criteria:**
- AI can create environments, set variables, run tests
- Secrets properly encrypted/redacted
- Collection runs complete in <5s for 10 requests

---

### Phase 3: AI-Powered Features (Weeks 7-9)

**Deliverables:**
- `generateTests` tool (AI-assisted test creation)
- Prompts library:
  - `debug-api-endpoint`
  - `create-test-suite`
  - `monitor-api-health`
- Import/export tools:
  - `importCollection` (Postman, OpenAPI, Insomnia)
  - `exportCollection` (multiple formats)
- Response analysis (schema detection, performance anomalies)

**Success Criteria:**
- AI can import Postman collection and generate tests
- Prompts guide AI through complex workflows
- Import success rate >95% for common formats

---

### Phase 4: Scale & Polish (Weeks 10-12)

**Deliverables:**
- Resource template system (handle 1000+ collections)
- Pagination and filtering
- Rate limiting (100/min, burst allowance)
- Audit logging
- Performance optimizations:
  - Connection pooling
  - Response caching
  - Batch operations
- Comprehensive documentation
- Example AI workflows

**Success Criteria:**
- Handles 10,000 collections without degradation
- Resource fetch <100ms for metadata
- Rate limiting prevents abuse
- Audit trail captures all actions

---

### Phase 5: Advanced Features (Weeks 13+)

**Deliverables:**
- Subscription model (push notifications)
- Collaborative features (shared collections)
- CI/CD integration (run tests in pipelines)
- GraphQL support
- WebSocket/SSE request types
- Mock server integration
- Historical analytics

**Future Expansion:**
- Plugin system for custom tools
- Multi-workspace support
- Team permissions
- Real-time collaboration

---

## Example AI Workflows

### Workflow 1: Create and Test API

```
User: "I need to test the GitHub API. Create a collection for it."

AI:
1. createCollection(name="GitHub API", baseUrl="https://api.github.com")
   → collectionId: abc-123

2. createRequest(
     collectionId="abc-123",
     name="Get User",
     method="GET",
     url="/user",
     headers={"Accept": "application/json"},
     tests=[
       {name: "Status is 200", assertion: "status == 200"},
       {name: "Has login field", assertion: "body.login != null"}
     ]
   )
   → requestId: def-456

3. User provides token →
   setVariable(environment="default", key="GITHUB_TOKEN", value="ghp_...", isSecret=true)

4. sendRequest(requestId="def-456", environment="default")
   → Status: 200, Tests: 2/2 passed

AI: "✅ GitHub API collection created with 1 request. All tests passed!"
```

---

### Workflow 2: Debug Failing Request

```
User: "My login endpoint is returning 401."

AI: [Applies debug-api-endpoint prompt]

1. Read resource: request://login-uuid
   → Sees POST /api/login with body {"username": "...", "password": "..."}

2. Check environment: environment://staging
   → API_URL = "https://staging.example.com"
   → AUTH_HEADER = null (missing!)

3. sendRequest(requestId="login-uuid")
   → 401 Unauthorized, header missing: "X-API-Key"

4. Analyze:
   - Expected auth header not present
   - Staging env missing AUTH_HEADER variable

AI: "🔍 Found the issue! Your staging environment is missing the `AUTH_HEADER` variable. 
The API expects an `X-API-Key` header but none is being sent. 

Would you like me to:
1. Add AUTH_HEADER to staging environment
2. Update the request to include the header
3. Both"
```

---

### Workflow 3: Import and Enhance

```
User: "Import this Postman collection and add performance tests."

AI:
1. importCollection(format="postman", data="<JSON>")
   → collectionId: xyz-789, importedRequests: 15

2. Read: collection://xyz-789
   → 15 requests across 3 folders

3. For each request:
   generateTests(requestId="...", testTypes=["performance"])
   → Suggests: "Response time < 500ms", "Response time < 1000ms", etc.

4. Apply tests:
   updateRequest(requestId="...", tests=[...])
   (repeat for all 15)

5. runCollection(collectionId="xyz-789")
   → 15/15 passed, avg response time: 320ms

AI: "✅ Imported 15 requests from Postman. Added performance tests to all endpoints. 
Current average response time: 320ms. All tests passing!"
```

---

## Appendix: Technical Stack

**MCP Server:**
- Language: TypeScript (Node.js 18+)
- Framework: Express.js + MCP SDK
- Protocol: JSON-RPC 2.0 over stdio/HTTP

**Database:**
- PostgreSQL 15+ (collections, requests, environments)
- Redis (caching, rate limiting)

**Storage:**
- Encrypted secrets: Vault or AWS Secrets Manager
- Response logs: S3 or local encrypted storage

**Security:**
- OAuth 2.1: Keycloak or Auth0
- Encryption: Node crypto (AES-256-GCM)

**Monitoring:**
- OpenTelemetry for traces
- Prometheus metrics
- Structured logging (Winston)

---

## Appendix: MCP Resource Schema

All resources follow this envelope:

```json
{
  "uri": "resource://{id}",
  "mimeType": "application/json",
  "data": {
    // Resource-specific data
  },
  "metadata": {
    "etag": "string",
    "lastModified": "ISO8601",
    "cacheControl": "max-age=300"
  }
}
```

---

## Conclusion

This MCP integration makes API testing **conversational and AI-native**. Instead of forcing AI to navigate UIs or parse documentation, we provide:

✅ **Direct tool access** - AI executes operations naturally
✅ **Rich context** - Resources provide state understanding
✅ **Guided workflows** - Prompts encode best practices
✅ **Enterprise security** - OAuth, secrets, audit trails
✅ **Production scale** - 1000+ collections, smart pagination

The result: AI agents become **power users** of the API testing tool, capable of complex workflows like debugging production issues, migrating API versions, and generating comprehensive test suites—all through natural conversation.

**Next Steps:**
1. Review this design with stakeholders
2. Validate technical stack choices
3. Begin Phase 1 implementation
4. Test with real AI agents (Claude, GPT-4)
5. Iterate based on usage patterns

---

*Design Document v1.0 - March 2026*
