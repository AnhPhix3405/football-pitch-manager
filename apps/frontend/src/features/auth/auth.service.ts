import type { AuthUser, LoginCredentials, RegisterDetails } from './auth.types'

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  await wait(650)
  if (credentials.email.toLowerCase() === 'blocked@pitchmaster.vn') {
    throw new Error('Tài khoản này hiện không thể truy cập hệ thống.')
  }
  const normalizedEmail = credentials.email.trim().toLowerCase()
  const role = normalizedEmail.includes('admin') ? 'admin' : normalizedEmail.includes('owner') ? 'owner' : 'user'
  return { id: crypto.randomUUID(), name: credentials.email.split('@')[0] || 'Cầu thủ', email: credentials.email, role }
}

export async function register(details: RegisterDetails): Promise<AuthUser> {
  await wait(750)
  return { id: crypto.randomUUID(), name: details.name, email: details.email, role: 'user' }
}
