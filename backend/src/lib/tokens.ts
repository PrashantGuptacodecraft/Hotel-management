import crypto from 'crypto'
import bcrypt from 'bcryptjs'

/** A URL-safe random token shown to the user (in email links). */
export const randomToken = (bytes = 32): string => crypto.randomBytes(bytes).toString('hex')

/**
 * Hash a token for storage. We use SHA-256 (fast, deterministic) so we can
 * look the value up directly — these are high-entropy single-use tokens, so a
 * salted-slow hash isn't required the way it is for passwords.
 */
export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex')

/** Bcrypt hash for the refresh token (compared, never looked-up). */
export const hashRefreshToken = (token: string): Promise<string> => bcrypt.hash(token, 10)
export const compareRefreshToken = (token: string, hash: string): Promise<boolean> =>
  bcrypt.compare(token, hash)

export const minutesFromNow = (min: number): Date => new Date(Date.now() + min * 60_000)
