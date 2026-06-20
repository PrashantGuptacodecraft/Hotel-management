import { Router } from 'express'
import * as analytics from '../controllers/analytics.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()
const VIEWERS = ['ADMIN', 'MANAGER', 'RECEPTIONIST'] as const

router.use(authenticate, authorize(...VIEWERS))
router.get('/dashboard', analytics.dashboard)
router.get('/revenue', analytics.revenue)
router.get('/overview', analytics.overview)

export default router
