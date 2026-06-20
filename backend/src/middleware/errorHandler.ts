import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ApiError } from '../lib/ApiError'
import { isProd } from '../config/env'

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, error: 'Route not found' })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
    })
    return
  }

  // Known Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: 'A record with that value already exists' })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Record not found' })
      return
    }
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
    return
  }

  const message = err instanceof Error ? err.message : 'Unknown error'
  console.error('❌ Unhandled error:', message)
  res.status(500).json({
    success: false,
    error: isProd ? 'Internal server error' : message,
  })
}
