import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ok } from '../lib/response'
import { smtpConfigured, geminiConfigured, env } from '../config/env'

// GET /system/status — integration health + property stats (admin/manager)
export async function status(_req: Request, res: Response): Promise<void> {
  const [rooms, guests, bookings, staff, events] = await Promise.all([
    prisma.room.count(),
    prisma.guest.count(),
    prisma.booking.count(),
    prisma.user.count({ where: { role: { not: 'CUSTOMER' } } }),
    prisma.hotelEvent.count(),
  ])
  ok(res, {
    integrations: {
      email: { configured: smtpConfigured, label: smtpConfigured ? `SMTP via ${env.SMTP_HOST}` : 'Dev mode (links logged to console)' },
      ai: { configured: geminiConfigured, label: geminiConfigured ? `Gemini · ${env.GEMINI_MODEL}` : 'Not configured' },
      payments: { configured: false, label: 'Simulated (no live gateway)' },
      database: { configured: true, label: 'SQLite · file:./dev.db' },
    },
    stats: { rooms, guests, bookings, staff, events },
  })
}
