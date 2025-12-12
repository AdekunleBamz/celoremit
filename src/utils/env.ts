/**
 * Environment variable validation and helpers
 */

export function validateEnv() {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for optional but recommended environment variables
  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY is not set. Fallback parsing will be used.');
  }

  // Validate OPENAI_API_KEY format if provided
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    warnings.push('OPENAI_API_KEY format may be incorrect.');
  }

  // Log warnings in development
  if (process.env.NODE_ENV === 'development' && warnings.length > 0) {
    console.warn('Environment variable warnings:', warnings);
  }

  // Throw errors if critical variables are missing
  if (errors.length > 0) {
    throw new Error(`Missing required environment variables: ${errors.join(', ')}`);
  }

  return { warnings, errors };
}

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

export function getEnvVarOptional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

