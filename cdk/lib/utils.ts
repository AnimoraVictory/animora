export function getRequiredEnvVars(keys: string[]): Record<string, string> {
  const envVars: Record<string, string> = {};

  for (const key of keys) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not set.`);
    }
    envVars[key] = value;
  }

  return envVars;
}
