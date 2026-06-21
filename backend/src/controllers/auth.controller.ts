import type { Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../config/prisma'
import { env } from '../config/env'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'
import { hashPassword, verifyPassword } from '../lib/password'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt'
import {
  randomToken,
  hashToken,
  hashRefreshToken,
  compareRefreshToken,
  minutesFromNow,
} from '../lib/tokens'
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE } from '../lib/cookies'
import { sendVerificationEmail, sendResetEmail } from '../lib/email'
import { publicUser } from '../lib/serialize'

type UserRow = NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>

/** Issue an access token + rotate the stored refresh token, set cookie. */
async function issueTokens(res: Response, user: UserRow): Promise<string> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email })
  const refreshToken = signRefreshToken({ sub: user.id, tokenId: crypto.randomUUID() })
  const refreshHash = await hashRefreshToken(refreshToken)
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refreshHash } })
  setRefreshCookie(res, refreshToken)
  return accessToken
}

const verifyLink = (token: string) => `${env.FRONTEND_URL}/verify-email?token=${token}`
const resetLink = (token: string) => `${env.FRONTEND_URL}/reset-password?token=${token}`

// ---------- POST /auth/register ----------
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, phone, nationality } = req.body

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) throw ApiError.conflict('An account with this email already exists')

  const passwordHash = await hashPassword(password)
  const rawToken = randomToken()
  const tokenHash = hashToken(rawToken)

  // Reuse an existing (unlinked) guest profile with this email, else create one.
  let guest = await prisma.guest.findUnique({ where: { email }, include: { user: true } })
  if (guest?.user) throw ApiError.conflict('An account with this email already exists')
  if (!guest) {
    guest = await prisma.guest.create({
      data: {
        name,
        email,
        phone: phone ?? '',
        nationality: nationality ?? 'Unknown',
        preferences: { create: {} },
      },
      include: { user: true },
    })
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: 'CUSTOMER',
      guestId: guest.id,
      emailVerified: false,
      emailVerifyToken: tokenHash,
      emailVerifyExpiry: minutesFromNow(24 * 60),
    },
  })

  // Never let a flaky SMTP provider break registration — log & continue.
  // The user can request a fresh link via "resend verification".
  await sendVerificationEmail(email, name, verifyLink(rawToken)).catch((e) =>
    console.error('Verification email failed to send:', e?.message)
  )

  created(res, {
    message: 'Account created. Please check your email to verify your account before logging in.',
    email,
  })
}

// ---------- POST /auth/verify-email ----------
export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.body
  const tokenHash = hashToken(token)

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: tokenHash, emailVerifyExpiry: { gt: new Date() } },
  })
  if (!user) throw ApiError.badRequest('This verification link is invalid or has expired')

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
  })

  ok(res, { message: 'Email verified successfully. You can now log in.' })
}

// ---------- POST /auth/resend-verification ----------
export async function resendVerification(req: Request, res: Response): Promise<void> {
  const { email } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  // Generic response to avoid account enumeration.
  if (user && !user.emailVerified) {
    const rawToken = randomToken()
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: hashToken(rawToken), emailVerifyExpiry: minutesFromNow(24 * 60) },
    })
    await sendVerificationEmail(email, user.name, verifyLink(rawToken))
  }
  ok(res, { message: 'If that account exists and is unverified, a new link has been sent.' })
}

// ---------- POST /auth/login ----------
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email }, include: { guest: true } })

  // Same generic message whether the email or password is wrong.
  if (!user || !(await verifyPassword(password, user.password))) {
    throw ApiError.unauthorized('Invalid email or password')
  }
  if (!user.emailVerified) {
    throw new ApiError(403, 'Please verify your email address before logging in')
  }

  const accessToken = await issueTokens(res, user)
  await prisma.user.update({ where: { id: user.id }, data: { isOnline: true, lastSeen: new Date() } })

  ok(res, { accessToken, user: publicUser(user) })
}

// ---------- POST /auth/refresh ----------
export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (!token) throw ApiError.unauthorized('No refresh token')

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw ApiError.unauthorized('Invalid refresh token')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { guest: true } })
  if (!user || !user.refreshToken) throw ApiError.unauthorized('Session expired')

  const valid = await compareRefreshToken(token, user.refreshToken)
  if (!valid) {
    // Token reuse / mismatch — invalidate the session entirely.
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } })
    clearRefreshCookie(res)
    throw ApiError.unauthorized('Session expired')
  }

  const accessToken = await issueTokens(res, user) // rotates refresh token
  ok(res, { accessToken, user: publicUser(user) })
}

// ---------- POST /auth/logout ----------
export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      await prisma.user.update({
        where: { id: payload.sub },
        data: { refreshToken: null, isOnline: false, lastSeen: new Date() },
      })
    } catch {
      /* ignore — clearing the cookie is enough */
    }
  }
  clearRefreshCookie(res)
  ok(res, { message: 'Logged out' })
}

// ---------- GET /auth/me ----------
export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { guest: true } })
  if (!user) throw ApiError.notFound('User not found')
  ok(res, { user: publicUser(user) })
}

// ---------- PATCH /auth/profile ----------
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name: req.body.name },
    include: { guest: true },
  })
  // Keep the linked guest profile name in sync for customers.
  if (user.guestId) {
    await prisma.guest.update({ where: { id: user.guestId }, data: { name: req.body.name } })
  }
  ok(res, { user: publicUser(user) })
}

// ---------- POST /auth/change-password ----------
export async function changePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user) throw ApiError.notFound('User not found')
  if (!(await verifyPassword(currentPassword, user.password))) {
    throw ApiError.badRequest('Your current password is incorrect')
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(newPassword), refreshToken: null },
  })
  clearRefreshCookie(res)
  ok(res, { message: 'Password changed. Please sign in again.' })
}

// ---------- POST /auth/forgot-password ----------
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    const rawToken = randomToken()
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashToken(rawToken), resetExpiry: minutesFromNow(30) },
    })
    await sendResetEmail(email, user.name, resetLink(rawToken))
  }
  // Always generic.
  ok(res, { message: 'If an account with that email exists, a reset link has been sent.' })
}

// ---------- POST /auth/reset-password ----------
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body
  const tokenHash = hashToken(token)
  const user = await prisma.user.findFirst({
    where: { resetToken: tokenHash, resetExpiry: { gt: new Date() } },
  })
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired')

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      resetToken: null,
      resetExpiry: null,
      refreshToken: null, // force re-login everywhere
    },
  })
  ok(res, { message: 'Password updated. You can now log in with your new password.' })
}
