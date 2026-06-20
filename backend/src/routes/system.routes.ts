import { Router } from 'express'
import * as system from '../controllers/system.controller'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.get('/status', authenticate, authorize('ADMIN', 'MANAGER'), system.status)

export default router
