import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ok } from '../lib/response'

// GET /notifications  (staff) — global + personal, newest first
export async function listNotifications(req: Request, res: Response): Promise<void> {
  const rows = await prisma.notification.findMany({
    where: { OR: [{ userId: null }, { userId: req.user!.id }] },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  ok(res, rows)
}

// PATCH /notifications/:id/read
export async function markRead(req: Request, res: Response): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: req.params.id, OR: [{ userId: null }, { userId: req.user!.id }] },
    data: { isRead: true },
  })
  ok(res, { message: 'Marked as read' })
}

// PATCH /notifications/read-all
export async function markAllRead(req: Request, res: Response): Promise<void> {
  await prisma.notification.updateMany({
    where: { OR: [{ userId: null }, { userId: req.user!.id }] },
    data: { isRead: true },
  })
  ok(res, { message: 'All notifications marked as read' })
}
