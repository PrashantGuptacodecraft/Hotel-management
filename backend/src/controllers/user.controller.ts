import type { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'
import { publicUser } from '../lib/serialize'
import { hashPassword } from '../lib/password'
import { STAFF_ROLES } from '../lib/enums'

// GET /users  (staff directory)
export async function listStaff(req: Request, res: Response): Promise<void> {
  const q = req.query as unknown as { department?: string; role?: string }
  const users = await prisma.user.findMany({
    where: {
      role: q.role ? q.role : { in: STAFF_ROLES },
      ...(q.department ? { department: q.department } : {}),
    },
    orderBy: { createdAt: 'asc' },
  })
  ok(res, users.map(publicUser))
}

// GET /users/:id
export async function getStaff(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user || user.role === 'CUSTOMER') throw ApiError.notFound('Staff member not found')
  ok(res, publicUser(user))
}

// POST /users  (admin) — create a staff account (pre-verified)
export async function createStaff(req: Request, res: Response): Promise<void> {
  const b = req.body
  const exists = await prisma.user.findUnique({ where: { email: b.email } })
  if (exists) throw ApiError.conflict('A user with this email already exists')

  const user = await prisma.user.create({
    data: {
      name: b.name,
      email: b.email,
      password: await hashPassword(b.password),
      role: b.role,
      department: b.department,
      emailVerified: true, // staff are provisioned by an admin
    },
  })
  created(res, publicUser(user))
}

// PATCH /users/:id  (admin)
export async function updateStaff(req: Request, res: Response): Promise<void> {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!target || target.role === 'CUSTOMER') throw ApiError.notFound('Staff member not found')

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name !== undefined ? { name: req.body.name } : {}),
      ...(req.body.role !== undefined ? { role: req.body.role } : {}),
      ...(req.body.department !== undefined ? { department: req.body.department } : {}),
    },
  })
  ok(res, publicUser(user))
}

// DELETE /users/:id  (admin)
export async function deleteStaff(req: Request, res: Response): Promise<void> {
  if (req.params.id === req.user!.id) throw ApiError.badRequest('You cannot delete your own account')
  const target = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!target || target.role === 'CUSTOMER') throw ApiError.notFound('Staff member not found')
  await prisma.user.delete({ where: { id: req.params.id } })
  ok(res, { message: 'Staff member removed' })
}
