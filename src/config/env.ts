function validateEnv(): void {
  const required: Record<string, string | undefined> = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_AUTH_URL: import.meta.env.VITE_AUTH_URL,
    VITE_FILES_API_URL: import.meta.env.VITE_FILES_API_URL,
  };

  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}`
    );
  }
}

validateEnv();

export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  authUrl: import.meta.env.VITE_AUTH_URL as string,
  filesApiUrl: import.meta.env.VITE_FILES_API_URL as string,
};
