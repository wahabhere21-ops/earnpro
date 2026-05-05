// EarnPro v2.0 - All English
import crypto from 'crypto'

const SALT = 'earnpro-app-salt-2024-secure'

export function hashPassword(password: string): string {
  return crypto.scryptSync(password, SALT, 64).toString('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  const newHash = crypto.scryptSync(password, SALT, 64).toString('hex')
  return newHash === hash
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
