import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('Luxe Grand <no-reply@luxegrand.com>'),

  STRIPE_SECRET_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:\n', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

// Hard refusal: never boot production with the bundled dev secrets.
if (env.NODE_ENV === 'production') {
  const weak = [env.JWT_SECRET, env.JWT_REFRESH_SECRET].some((s) => s.includes('change_me') || s.length < 32)
  if (weak) {
    console.error('❌ Refusing to start in production with weak/default JWT secrets. Set strong secrets in .env.')
    process.exit(1)
  }
}

export const isProd = env.NODE_ENV === 'production'
export const smtpConfigured = Boolean(env.SMTP_USER && env.SMTP_PASS)
export const geminiConfigured = Boolean(env.GEMINI_API_KEY)
