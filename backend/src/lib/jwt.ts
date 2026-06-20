import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'

export interface AccessTokenPayload {
  sub: string // user id
  role: string
  email: string
}

export interface RefreshTokenPayload {
  sub: string
  tokenId: string // random id, lets us invalidate by rotating
}

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions)

export const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions)

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
