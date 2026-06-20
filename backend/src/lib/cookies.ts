import type { Response } from 'express'
import { isProd } from '../config/env'

export const REFRESH_COOKIE = 'lg_refresh'

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

/** httpOnly + sameSite=strict refresh cookie, scoped to the auth routes. */
export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: REFRESH_MAX_AGE,
  })
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
}
