import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'
import { ApiError } from '../lib/ApiError'
import type { UserRole } from '../lib/enums'

/** Verifies the Bearer access token and attaches req.user. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required')
  }
  const token = header.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, role: payload.role, email: payload.email }
    next()
  } catch {
    throw ApiError.unauthorized('Invalid or expired token')
  }
}

/** Restricts a route to the given roles. Use after authenticate. */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw ApiError.unauthorized('Authentication required')
    if (!roles.includes(req.user.role as UserRole)) {
      throw ApiError.forbidden('You do not have permission to access this resource')
    }
    next()
  }
}
