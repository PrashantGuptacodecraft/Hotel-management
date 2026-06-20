import { Router } from 'express'
import * as rooms from '../controllers/room.controller'
import { validate } from '../middleware/validate'
import { authenticate, authorize } from '../middleware/auth'
import { idParam } from '../validators/common.schema'
import {
  listRoomsQuery,
  availableRoomsQuery,
  createRoomSchema,
  updateRoomSchema,
} from '../validators/room.schema'

const router = Router()

// Public: customers browse availability without an account page-load barrier
router.get('/available', validate({ query: availableRoomsQuery }), rooms.availableRooms)

// Staff
router.get('/', authenticate, validate({ query: listRoomsQuery }), rooms.listRooms)
router.get('/:id', validate({ params: idParam }), rooms.getRoom)
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate({ body: createRoomSchema }), rooms.createRoom)
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'),
  validate({ params: idParam, body: updateRoomSchema }),
  rooms.updateRoom
)
router.delete('/:id', authenticate, authorize('ADMIN'), validate({ params: idParam }), rooms.deleteRoom)

export default router
