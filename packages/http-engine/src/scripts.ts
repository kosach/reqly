/**
 * Script execution for Reqly
 * Handles pre-request and test scripts with a Postman-compatible API
 */

export interface ScriptContext {
  environment: Record<string, string>;
  logs: string[];
}

export interface ScriptResult {
  environment: Record<string, string>;
  logs: string[];
  error?: string;
}

/**
 * Execute a pre-request script
 * Provides a pm object compatible with Postman's API
 */
export async function executePreRequestScript(
  script: string,
  initialEnvironment: Record<string, string> = {}
): Promise<ScriptResult> {
  const context: ScriptContext = {
    environment: { ...initialEnvironment },
    logs: [],
  };

  try {
    // Create pm API object
    const pm = {
      environment: {
        set: (key: string, value: string | number | boolean) => {
          context.environment[key] = String(value);
          context.logs.push(`[Script] Set variable: ${key} = ${value}`);
        },
        get: (key: string): string | undefined => {
          return context.environment[key];
        },
        has: (key: string): boolean => {
          return key in context.environment;
        },
        unset: (key: string) => {
          delete context.environment[key];
          context.logs.push(`[Script] Unset variable: ${key}`);
        },
      },
      variables: {
        set: (key: string, value: string | number | boolean) => {
          context.environment[key] = String(value);
          context.logs.push(`[Script] Set variable: ${key} = ${value}`);
        },
        get: (key: string): string | undefined => {
          return context.environment[key];
        },
      },
      request: {
        headers: {},
        url: '',
        method: '',
      },
      response: null,
    };

    // Create console object for logging
    const console = {
      log: (...args: unknown[]) => {
        context.logs.push(`[Script] ${args.map(String).join(' ')}`);
      },
      error: (...args: unknown[]) => {
        context.logs.push(`[Script Error] ${args.map(String).join(' ')}`);
      },
      warn: (...args: unknown[]) => {
        context.logs.push(`[Script Warning] ${args.map(String).join(' ')}`);
      },
      info: (...args: unknown[]) => {
        context.logs.push(`[Script Info] ${args.map(String).join(' ')}`);
      },
    };

    // Execute script in isolated scope
    const scriptFunction = new Function('pm', 'console', script);
    scriptFunction(pm, console);

    return {
      environment: context.environment,
      logs: context.logs,
    };
  } catch (error) {
    context.logs.push(`[Script Error] ${error instanceof Error ? error.message : String(error)}`);

    return {
      environment: context.environment,
      logs: context.logs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Test result from test script execution
 */
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface TestScriptResult extends ScriptResult {
  tests: TestResult[];
}

/**
 * Execute a test script
 * Provides a pm object with test assertions
 */
export async function executeTestScript(
  script: string,
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
  },
  initialEnvironment: Record<string, string> = {}
): Promise<TestScriptResult> {
  const context: ScriptContext = {
    environment: { ...initialEnvironment },
    logs: [],
  };

  const tests: TestResult[] = [];

  try {
    // Parse response body as JSON if possible
    let responseJson: unknown = null;
    try {
      responseJson = JSON.parse(response.body);
    } catch {
      // Not JSON, leave as null
    }

    // Create pm API object with test capabilities
    const pm = {
      environment: {
        set: (key: string, value: string | number | boolean) => {
          context.environment[key] = String(value);
          context.logs.push(`[Script] Set variable: ${key} = ${value}`);
        },
        get: (key: string): string | undefined => {
          return context.environment[key];
        },
        has: (key: string): boolean => {
          return key in context.environment;
        },
        unset: (key: string) => {
          delete context.environment[key];
          context.logs.push(`[Script] Unset variable: ${key}`);
        },
      },
      variables: {
        set: (key: string, value: string | number | boolean) => {
          context.environment[key] = String(value);
        },
        get: (key: string): string | undefined => {
          return context.environment[key];
        },
      },
      response: {
        code: response.status,
        status: response.statusText,
        headers: response.headers,
        json: () => responseJson,
        text: () => response.body,
        to: {
          have: {
            status: (expected: number) => {
              if (response.status !== expected) {
                throw new Error(
                  `Expected status ${expected}, got ${response.status}`
                );
              }
            },
            header: (name: string) => {
              const lowerName = name.toLowerCase();
              const hasHeader = Object.keys(response.headers).some(
                (h) => h.toLowerCase() === lowerName
              );
              if (!hasHeader) {
                throw new Error(`Expected header '${name}' not found`);
              }
            },
          },
          be: {
            ok: () => {
              if (response.status < 200 || response.status >= 300) {
                throw new Error(`Expected OK status, got ${response.status}`);
              }
            },
          },
        },
      },
      test: (name: string, fn: () => void) => {
        try {
          fn();
          tests.push({ name, passed: true });
          context.logs.push(`[Test] ✓ ${name}`);
        } catch (error) {
          tests.push({
            name,
            passed: false,
            error: error instanceof Error ? error.message : String(error),
          });
          context.logs.push(
            `[Test] ✗ ${name}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      },
      expect: (value: unknown) => ({
        to: {
          equal: (expected: unknown) => {
            if (value !== expected) {
              throw new Error(`Expected ${expected}, got ${value}`);
            }
          },
          be: {
            a: (type: string) => {
              const actualType = typeof value;
              if (actualType !== type) {
                throw new Error(`Expected type ${type}, got ${actualType}`);
              }
            },
          },
          have: {
            property: (prop: string) => {
              if (typeof value !== 'object' || value === null) {
                throw new Error('Value is not an object');
              }
              if (!(prop in value)) {
                throw new Error(`Property '${prop}' not found`);
              }
            },
          },
        },
      }),
    };

    const console = {
      log: (...args: unknown[]) => {
        context.logs.push(`[Script] ${args.map(String).join(' ')}`);
      },
      error: (...args: unknown[]) => {
        context.logs.push(`[Script Error] ${args.map(String).join(' ')}`);
      },
      warn: (...args: unknown[]) => {
        context.logs.push(`[Script Warning] ${args.map(String).join(' ')}`);
      },
      info: (...args: unknown[]) => {
        context.logs.push(`[Script Info] ${args.map(String).join(' ')}`);
      },
    };

    // Execute script
    const scriptFunction = new Function('pm', 'console', script);
    scriptFunction(pm, console);

    return {
      environment: context.environment,
      logs: context.logs,
      tests,
    };
  } catch (error) {
    context.logs.push(`[Script Error] ${error instanceof Error ? error.message : String(error)}`);

    return {
      environment: context.environment,
      logs: context.logs,
      tests,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
