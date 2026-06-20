import { Router } from 'express'
import * as concierge from '../controllers/concierge.controller'
import { chatSchema } from '../controllers/concierge.controller'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.get('/status', concierge.status)
router.post('/chat', validate({ body: chatSchema }), concierge.chat)

export default router
