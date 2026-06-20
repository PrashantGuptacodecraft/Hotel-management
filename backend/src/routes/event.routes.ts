import { Router } from 'express'
import * as e from '../controllers/event.controller'
import { validate } from '../middleware/validate'
import { authenticate, authorize } from '../middleware/auth'
import { idParam } from '../validators/common.schema'
import { createEventSchema, updateEventSchema } from '../validators/event.schema'

const router = Router()
const PLANNERS = ['ADMIN', 'MANAGER'] as const

router.use(authenticate, authorize('ADMIN', 'MANAGER', 'RECEPTIONIST'))

router.get('/venues', e.listVenues)
router.get('/', e.listEvents)
router.post('/', authorize(...PLANNERS), validate({ body: createEventSchema }), e.createEvent)
router.patch('/:id', authorize(...PLANNERS), validate({ params: idParam, body: updateEventSchema }), e.updateEvent)
router.delete('/:id', authorize('ADMIN'), validate({ params: idParam }), e.deleteEvent)

export default router
