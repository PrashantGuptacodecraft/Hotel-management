import rateLimit from 'express-rate-limit'

/** Generous global limiter for all API traffic. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please slow down.' },
})

/** Strict limiter for auth endpoints to throttle brute force / abuse. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // Don't count successful logins/registrations against the limit.
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Too many attempts. Please try again later.' },
})
