export const USER_ROLES = { user: 'user', owner: 'owner', admin: 'admin' } as const
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
