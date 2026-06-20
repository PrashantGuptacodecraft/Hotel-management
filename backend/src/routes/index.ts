import { Router } from 'express'
import authRoutes from './auth.routes'
import roomRoutes from './room.routes'
import bookingRoutes from './booking.routes'
import guestRoutes from './guest.routes'
import userRoutes from './user.routes'
import taskRoutes from './task.routes'
import reviewRoutes from './review.routes'
import analyticsRoutes from './analytics.routes'
import notificationRoutes from './notification.routes'
import conciergeRoutes from './concierge.routes'
import restaurantRoutes from './restaurant.routes'
import eventRoutes from './event.routes'
import systemRoutes from './system.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Luxe Grand Hotel Management API',
    version: '1.0.0',
  })
})

router.use('/auth', authRoutes)
router.use('/rooms', roomRoutes)
router.use('/bookings', bookingRoutes)
router.use('/guests', guestRoutes)
router.use('/users', userRoutes)
router.use('/tasks', taskRoutes)
router.use('/reviews', reviewRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/notifications', notificationRoutes)
router.use('/concierge', conciergeRoutes)
router.use('/restaurant', restaurantRoutes)
router.use('/events', eventRoutes)
router.use('/system', systemRoutes)

export default router
