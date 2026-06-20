import type { Response } from 'express'

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function ok<T>(res: Response, data: T, pagination?: Pagination): Response {
  return res.json({ success: true, data, ...(pagination ? { pagination } : {}) })
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json({ success: true, data })
}
