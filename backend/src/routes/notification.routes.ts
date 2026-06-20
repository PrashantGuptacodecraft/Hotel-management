import { Router } from 'express'
import * as notifications from '../controllers/notification.controller'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import { idParam } from '../validators/common.schema'

const router = Router()

router.use(authenticate)
router.get('/', notifications.listNotifications)
router.patch('/read-all', notifications.markAllRead)
router.patch('/:id/read', validate({ params: idParam }), notifications.markRead)

export default router
