import { Router } from 'express'
import * as r from '../controllers/restaurant.controller'
import { validate } from '../middleware/validate'
import { authenticate, authorize } from '../middleware/auth'
import { idParam } from '../validators/common.schema'
import {
  updateTableSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validators/restaurant.schema'

const router = Router()
const FNB = ['ADMIN', 'MANAGER', 'CHEF', 'RECEPTIONIST'] as const

router.use(authenticate, authorize(...FNB))

// Tables
router.get('/tables', r.listTables)
router.patch('/tables/:id', validate({ params: idParam, body: updateTableSchema }), r.updateTable)

// Menu
router.get('/menu', r.listMenu)
router.post('/menu', authorize('ADMIN', 'MANAGER', 'CHEF'), validate({ body: createMenuItemSchema }), r.createMenuItem)
router.patch('/menu/:id', validate({ params: idParam, body: updateMenuItemSchema }), r.updateMenuItem)

// Orders
router.get('/orders', r.listOrders)
router.post('/orders', validate({ body: createOrderSchema }), r.createOrder)
router.patch('/orders/:id/status', validate({ params: idParam, body: updateOrderStatusSchema }), r.updateOrderStatus)

export default router
