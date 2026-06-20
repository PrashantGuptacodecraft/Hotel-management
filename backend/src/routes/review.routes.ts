import { Router } from 'express'
import * as reviews from '../controllers/review.controller'
import { createReviewSchema } from '../controllers/review.controller'
import { validate } from '../middleware/validate'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.get('/', authorize('ADMIN', 'MANAGER', 'CONCIERGE'), reviews.listReviews)
router.post('/', validate({ body: createReviewSchema }), reviews.createReview)

export default router
