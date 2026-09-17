function readEnv(name: keyof ImportMetaEnv, fallback: string) {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.trim() ? value : fallback
}

export const env = {
  apiUrl: readEnv('VITE_API_URL', 'http://localhost:8080/api'),
  appName: readEnv('VITE_APP_NAME', 'PitchMaster'),
} as const
