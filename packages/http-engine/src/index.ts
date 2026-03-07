/**
 * Reqly HTTP Engine
 * HTTP client with variable interpolation and scripting support
 */

export { HTTPClient, httpClient } from './client';
export type { RequestContext, RequestResult, TestResult } from './client';

export {
  interpolateVariables,
  extractVariableNames,
  validateVariables,
  interpolateObject,
} from './variables';

export {
  executePreRequestScript,
  executeTestScript,
} from './scripts';
export type {
  ScriptContext,
  ScriptResult,
  TestScriptResult,
} from './scripts';
