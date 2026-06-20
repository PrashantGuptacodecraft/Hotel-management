import { Router } from 'express'
import * as guests from '../controllers/guest.controller'
import { validate } from '../middleware/validate'
import { authenticate, authorize } from '../middleware/auth'
import { idParam } from '../validators/common.schema'
import {
  listGuestsQuery,
  createGuestSchema,
  updateGuestSchema,
  preferencesSchema,
} from '../validators/guest.schema'

const router = Router()
const STAFF = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'CONCIERGE'] as const

router.use(authenticate)

// Customer self-service
router.get('/me/profile', guests.myProfile)
router.patch('/me/preferences', validate({ body: preferencesSchema }), guests.updateMyPreferences)

// Staff CRM
router.get('/', authorize(...STAFF), validate({ query: listGuestsQuery }), guests.listGuests)
router.post('/', authorize(...STAFF), validate({ body: createGuestSchema }), guests.createGuest)
router.get('/:id', authorize(...STAFF), validate({ params: idParam }), guests.getGuest)
router.patch('/:id', authorize(...STAFF), validate({ params: idParam, body: updateGuestSchema }), guests.updateGuest)

export default router
