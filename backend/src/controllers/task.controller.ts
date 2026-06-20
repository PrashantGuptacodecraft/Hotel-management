import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'
import { serializeRoom } from '../lib/serialize'
import { publicUser } from '../lib/serialize'
import { emitToStaff } from '../socket/io'

const include = { assignedTo: true, room: true } as const
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shape = (t: any) => ({
  ...t,
  assignedTo: t.assignedTo ? publicUser(t.assignedTo) : null,
  room: t.room ? serializeRoom(t.room) : null,
})

// GET /tasks
export async function listTasks(req: Request, res: Response): Promise<void> {
  const q = req.query as Record<string, string | undefined>
  const rows = await prisma.task.findMany({
    where: {
      ...(q.status ? { status: q.status } : {}),
      ...(q.assignedToId ? { assignedToId: q.assignedToId } : {}),
      ...(q.category ? { category: q.category } : {}),
    },
    include,
    orderBy: { createdAt: 'desc' },
  })
  ok(res, rows.map(shape))
}

// POST /tasks
export async function createTask(req: Request, res: Response): Promise<void> {
  const b = req.body
  const task = await prisma.task.create({
    data: {
      title: b.title,
      description: b.description,
      assignedToId: b.assignedToId,
      createdById: req.user!.id,
      roomId: b.roomId,
      priority: b.priority,
      category: b.category,
      dueAt: b.dueAt,
    },
    include,
  })
  emitToStaff('task-updated', shape(task))
  created(res, shape(task))
}

// PATCH /tasks/:id
export async function updateTask(req: Request, res: Response): Promise<void> {
  const exists = await prisma.task.findUnique({ where: { id: req.params.id } })
  if (!exists) throw ApiError.notFound('Task not found')
  const b = req.body
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...(b.title !== undefined ? { title: b.title } : {}),
      ...(b.description !== undefined ? { description: b.description } : {}),
      ...(b.assignedToId !== undefined ? { assignedToId: b.assignedToId } : {}),
      ...(b.priority !== undefined ? { priority: b.priority } : {}),
      ...(b.status !== undefined ? { status: b.status } : {}),
      ...(b.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
    },
    include,
  })
  emitToStaff('task-updated', shape(task))
  ok(res, shape(task))
}

// DELETE /tasks/:id
export async function deleteTask(req: Request, res: Response): Promise<void> {
  await prisma.task.delete({ where: { id: req.params.id } })
  ok(res, { message: 'Task deleted' })
}
