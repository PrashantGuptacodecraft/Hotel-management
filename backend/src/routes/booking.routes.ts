import { Router } from 'express'
import * as bookings from '../controllers/booking.controller'
import { validate } from '../middleware/validate'
import { authenticate, authorize } from '../middleware/auth'
import { idParam } from '../validators/common.schema'
import {
  createBookingSchema,
  customerBookingSchema,
  listBookingsQuery,
  updateStatusSchema,
} from '../validators/booking.schema'

const router = Router()
const STAFF = ['ADMIN', 'MANAGER', 'RECEPTIONIST'] as const

router.use(authenticate)

// Customer self-service
router.get('/mine', bookings.myBookings)
router.post('/book', validate({ body: customerBookingSchema }), bookings.bookAsCustomer)
router.patch('/:id/cancel', validate({ params: idParam }), bookings.cancelOwn)

// Staff
router.get('/', authorize(...STAFF), validate({ query: listBookingsQuery }), bookings.listBookings)
router.post('/', authorize(...STAFF), validate({ body: createBookingSchema }), bookings.createBooking)
router.patch(
  '/:id/status',
  authorize(...STAFF),
  validate({ params: idParam, body: updateStatusSchema }),
  bookings.updateStatus
)

// Shared (ownership enforced in controller)
router.get('/:id', validate({ params: idParam }), bookings.getBooking)

export default router
