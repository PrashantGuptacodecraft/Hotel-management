import type { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { ApiError } from '../lib/ApiError'
import { ok, created } from '../lib/response'

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// GET /reviews  (staff)
export async function listReviews(_req: Request, res: Response): Promise<void> {
  const rows = await prisma.review.findMany({
    include: { guest: { select: { id: true, name: true, avatar: true, loyaltyTier: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  ok(res, rows)
}

// POST /reviews  (customer) — leave a review tied to their guest profile
export async function createReview(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user?.guestId) throw ApiError.badRequest('Only guests can leave reviews')
  const review = await prisma.review.create({
    data: {
      guestId: user.guestId,
      rating: req.body.rating,
      comment: req.body.comment,
      // Naïve sentiment proxy from rating; a real impl would call an NLP service.
      sentiment: req.body.rating / 5,
      source: 'direct',
    },
  })
  created(res, review)
}
