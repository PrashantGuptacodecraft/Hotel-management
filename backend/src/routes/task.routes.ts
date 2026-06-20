import { Router } from 'express'
import * as tasks from '../controllers/task.controller'
import { validate } from '../middleware/validate'
import { authenticate, authorize } from '../middleware/auth'
import { idParam } from '../validators/common.schema'
import { listTasksQuery, createTaskSchema, updateTaskSchema } from '../validators/task.schema'

const router = Router()
const STAFF = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING', 'CONCIERGE', 'CHEF', 'SECURITY'] as const

router.use(authenticate, authorize(...STAFF))

router.get('/', validate({ query: listTasksQuery }), tasks.listTasks)
router.post('/', authorize('ADMIN', 'MANAGER', 'RECEPTIONIST'), validate({ body: createTaskSchema }), tasks.createTask)
router.patch('/:id', validate({ params: idParam, body: updateTaskSchema }), tasks.updateTask)
router.delete('/:id', authorize('ADMIN', 'MANAGER'), validate({ params: idParam }), tasks.deleteTask)

export default router
