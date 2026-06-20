import { Router } from 'express'
import * as auth from '../controllers/auth.controller'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimit'
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.schema'

const router = Router()

router.post('/register', authLimiter, validate({ body: registerSchema }), auth.register)
router.post('/verify-email', validate({ body: verifyEmailSchema }), auth.verifyEmail)
router.post('/resend-verification', authLimiter, validate({ body: resendVerificationSchema }), auth.resendVerification)
router.post('/login', authLimiter, validate({ body: loginSchema }), auth.login)
router.post('/refresh', auth.refresh)
router.post('/logout', auth.logout)
router.get('/me', authenticate, auth.me)
router.patch('/profile', authenticate, validate({ body: updateProfileSchema }), auth.updateProfile)
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), auth.changePassword)
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), auth.forgotPassword)
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), auth.resetPassword)

export default router
