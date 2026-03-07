# @reqly/http-engine

HTTP request engine for Reqly with variable interpolation and scripting support.

## Features

- **HTTP Methods**: GET, POST, PUT, DELETE, PATCH
- **Variable Interpolation**: `{{variableName}}` syntax in URLs, headers, and bodies
- **Pre-Request Scripts**: Execute JavaScript before sending requests
- **Test Scripts**: Run assertions on responses (Postman-compatible)
- **Environment Variables**: Support for multiple environments
- **Request Logging**: Detailed logs for debugging
- **Error Handling**: Network timeouts, connection errors, HTTP errors

## Installation

```bash
pnpm add @reqly/http-engine
```

## Usage

### Basic HTTP Requests

```typescript
import { httpClient } from '@reqly/http-engine';

// Simple GET request
const response = await httpClient.get('https://api.example.com/users');

// POST with JSON body
const createResponse = await httpClient.post(
  'https://api.example.com/users',
  JSON.stringify({ name: 'John Doe' }),
  { 'Content-Type': 'application/json' }
);
```

### Variable Interpolation

```typescript
import { HTTPClient } from '@reqly/http-engine';

const client = new HTTPClient();

const result = await client.sendRequest({
  request: {
    id: 'req-1',
    name: 'Get User',
    method: 'GET',
    url: 'https://{{host}}/api/users/{{userId}}',
    headers: {
      'Authorization': 'Bearer {{apiToken}}',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  environment: {
    id: 'env-1',
    name: 'Production',
    variables: [
      { key: 'host', value: 'api.example.com', type: 'default' },
      { key: 'userId', value: '123', type: 'default' },
      { key: 'apiToken', value: 'secret', type: 'secret' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

console.log(result.response.status); // 200
console.log(result.logs); // Request execution logs
```

### Pre-Request Scripts

```typescript
const result = await client.sendRequest({
  request: {
    id: 'req-1',
    name: 'Create Order',
    method: 'POST',
    url: 'https://api.example.com/orders',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': '{{requestId}}',
      'X-Timestamp': '{{timestamp}}',
    },
    body: JSON.stringify({ amount: '{{amount}}' }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  preRequestScript: `
    // Generate dynamic values
    pm.environment.set('requestId', crypto.randomUUID());
    pm.environment.set('timestamp', Date.now());
    pm.environment.set('amount', '99.99');

    console.log('Pre-request script executed');
  `,
});
```

### Test Scripts

```typescript
const result = await client.sendRequest({
  request: {
    id: 'req-1',
    name: 'Get User',
    method: 'GET',
    url: 'https://api.example.com/users/123',
    headers: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  testScript: `
    pm.test('Status is 200', () => {
      pm.response.to.have.status(200);
    });

    pm.test('Response has user data', () => {
      const json = pm.response.json();
      pm.expect(json).to.have.property('id');
      pm.expect(json).to.have.property('name');
    });

    pm.test('Response time is acceptable', () => {
      pm.expect(pm.response.time).to.be.below(1000);
    });

    // Extract data for next request
    const user = pm.response.json();
    pm.environment.set('userName', user.name);
  `,
});

console.log(result.scriptOutput.test); // Test results
```

## API Reference

### HTTPClient

```typescript
class HTTPClient {
  constructor(options?: {
    timeout?: number;          // Default: 30000ms
    maxRedirects?: number;     // Default: 5
    validateStatus?: (status: number) => boolean;
  });

  // Full request with context
  sendRequest(context: RequestContext): Promise<RequestResult>;

  // Convenience methods
  get(url: string, headers?: Record<string, string>): Promise<Response>;
  post(url: string, body?: string, headers?: Record<string, string>): Promise<Response>;
  put(url: string, body?: string, headers?: Record<string, string>): Promise<Response>;
  delete(url: string, headers?: Record<string, string>): Promise<Response>;
  patch(url: string, body?: string, headers?: Record<string, string>): Promise<Response>;
}
```

### Variable Functions

```typescript
// Interpolate variables in a string
interpolateVariables(template: string, variables: Record<string, string>): string;

// Extract variable names from template
extractVariableNames(template: string): string[];

// Validate all variables are available
validateVariables(
  template: string,
  variables: Record<string, string>
): { valid: boolean; missing: string[] };

// Interpolate entire object
interpolateObject<T>(templates: T, variables: Record<string, string>): T;
```

### Script Functions

```typescript
// Execute pre-request script
executePreRequestScript(
  script: string,
  initialEnvironment?: Record<string, string>
): Promise<ScriptResult>;

// Execute test script
executeTestScript(
  script: string,
  response: Response,
  initialEnvironment?: Record<string, string>
): Promise<TestScriptResult>;
```

## Script API (Postman-compatible)

Pre-request and test scripts have access to a `pm` object:

### Environment

```javascript
// Set variable
pm.environment.set('key', 'value');

// Get variable
const value = pm.environment.get('key');

// Check if variable exists
if (pm.environment.has('key')) { }

// Remove variable
pm.environment.unset('key');
```

### Tests (test scripts only)

```javascript
// Define test
pm.test('Test name', () => {
  // Assertions here
});

// Check status
pm.response.to.have.status(200);
pm.response.to.be.ok(); // 2xx status

// Check headers
pm.response.to.have.header('content-type');

// Access response data
const json = pm.response.json();
const text = pm.response.text();

// Expectations
pm.expect(value).to.equal(expected);
pm.expect(value).to.be.a('string');
pm.expect(obj).to.have.property('key');
```

### Console

```javascript
console.log('Message');
console.error('Error');
console.warn('Warning');
console.info('Info');
```

## Testing

```bash
# Run all tests
pnpm test

# Run E2E tests only
pnpm test:e2e

# Watch mode
pnpm test:watch
```

## License

MIT
