function readEnv(name: keyof ImportMetaEnv, fallback: string) {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.trim() ? value : fallback
}

export const env = {
  apiUrl: readEnv('VITE_API_URL', 'http://localhost:3000'),
  appName: readEnv('VITE_APP_NAME', 'PitchMaster'),
  googleClientId: readEnv('VITE_GOOGLE_CLIENT_ID', '719871868833-73e0keahdoet89k2g7hfma8qn9i2bsln.apps.googleusercontent.com'),
} as const
