import { Router } from 'express'
import * as users from '../controllers/user.controller'
import { validate } from '../middleware/validate'
import { authenticate, authorize } from '../middleware/auth'
import { idParam } from '../validators/common.schema'
import { listStaffQuery, createStaffSchema, updateStaffSchema } from '../validators/user.schema'

const router = Router()

router.use(authenticate)

router.get('/', authorize('ADMIN', 'MANAGER'), validate({ query: listStaffQuery }), users.listStaff)
router.get('/:id', authorize('ADMIN', 'MANAGER'), validate({ params: idParam }), users.getStaff)
router.post('/', authorize('ADMIN'), validate({ body: createStaffSchema }), users.createStaff)
router.patch('/:id', authorize('ADMIN'), validate({ params: idParam, body: updateStaffSchema }), users.updateStaff)
router.delete('/:id', authorize('ADMIN'), validate({ params: idParam }), users.deleteStaff)

export default router
