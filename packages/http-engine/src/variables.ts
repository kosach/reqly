/**
 * Variable interpolation for Reqly
 * Supports {{variableName}} syntax in URLs, headers, and bodies
 */

/**
 * Interpolate variables in a string using {{variableName}} syntax
 * @param template - String with {{variable}} placeholders
 * @param variables - Map of variable names to values
 * @returns Interpolated string
 */
export function interpolateVariables(
  template: string,
  variables: Record<string, string>
): string {
  // Match {{variableName}} patterns
  const pattern = /\{\{([^}]+)\}\}/g;

  return template.replace(pattern, (match, variableName) => {
    const trimmedName = variableName.trim();

    // Check if variable exists
    if (trimmedName in variables) {
      return variables[trimmedName];
    }

    // Variable not found - return original placeholder
    return match;
  });
}

/**
 * Extract all variable names from a template string
 * @param template - String with {{variable}} placeholders
 * @returns Array of variable names found
 */
export function extractVariableNames(template: string): string[] {
  const pattern = /\{\{([^}]+)\}\}/g;
  const names: string[] = [];
  let match;

  while ((match = pattern.exec(template)) !== null) {
    names.push(match[1].trim());
  }

  return names;
}

/**
 * Validate that all variables in a template are available
 * @param template - String with {{variable}} placeholders
 * @param variables - Available variables
 * @returns Object with validation result and missing variables
 */
export function validateVariables(
  template: string,
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const required = extractVariableNames(template);
  const missing = required.filter((name) => !(name in variables));

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Interpolate variables in multiple strings at once
 * @param templates - Object with string values to interpolate
 * @param variables - Map of variable names to values
 * @returns Object with interpolated values
 */
export function interpolateObject<T extends Record<string, string>>(
  templates: T,
  variables: Record<string, string>
): T {
  const result = {} as T;

  for (const [key, value] of Object.entries(templates)) {
    result[key as keyof T] = interpolateVariables(value, variables) as T[keyof T];
  }

  return result;
}
