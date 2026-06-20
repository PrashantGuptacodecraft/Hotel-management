import { z } from 'zod'

export const idParam = z.object({ id: z.string().min(1) })

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type Pagination = z.infer<typeof paginationQuery>

/** Build Prisma skip/take + a helper to shape the pagination response. */
export function paginate(p: Pagination) {
  const skip = (p.page - 1) * p.limit
  return {
    skip,
    take: p.limit,
    meta: (total: number) => ({
      total,
      page: p.page,
      limit: p.limit,
      totalPages: Math.max(1, Math.ceil(total / p.limit)),
    }),
  }
}
