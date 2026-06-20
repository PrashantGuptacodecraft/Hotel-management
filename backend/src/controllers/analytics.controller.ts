import type { Request, Response } from 'express'
import { ok } from '../lib/response'
import { getDashboard, getRevenueSeries, getOverview } from '../services/analytics.service'

// GET /analytics/dashboard
export async function dashboard(_req: Request, res: Response): Promise<void> {
  ok(res, await getDashboard())
}

// GET /analytics/revenue?days=30
export async function revenue(req: Request, res: Response): Promise<void> {
  const days = Math.min(365, Math.max(7, Number(req.query.days) || 30))
  ok(res, await getRevenueSeries(days))
}

// GET /analytics/overview
export async function overview(_req: Request, res: Response): Promise<void> {
  ok(res, await getOverview())
}
