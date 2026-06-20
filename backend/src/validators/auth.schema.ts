import { z } from 'zod'

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100)
  .regex(/[a-z]/, 'Must include a lowercase letter')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')

// Treat empty strings from optional form fields as "not provided".
const emptyToUndef = (v: unknown) => (v === '' ? undefined : v)

export const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your full name').max(80),
  email: z.string().email('Enter a valid email').toLowerCase(),
  password,
  phone: z.preprocess(emptyToUndef, z.string().min(5).max(30).optional()),
  nationality: z.preprocess(emptyToUndef, z.string().min(2).max(60).optional()),
})

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
})

export const resendVerificationSchema = z.object({
  email: z.string().email().toLowerCase(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password,
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
