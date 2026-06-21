import 'express-async-errors'
import path from 'path'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { env, isProd } from './config/env'
import apiRoutes from './routes'
import { globalLimiter } from './middleware/rateLimit'
import { parseCookies } from './middleware/cookies'
import { notFound, errorHandler } from './middleware/errorHandler'
import { initSockets } from './socket'

const app = express()
const httpServer = createServer(app)

// Render (and most hosts) sit behind a reverse proxy — trust it so secure
// cookies and client IPs (for rate limiting) are handled correctly.
if (isProd) app.set('trust proxy', 1)

// --- Socket.io ---
export const io = new Server(httpServer, {
  cors: { origin: env.FRONTEND_URL, methods: ['GET', 'POST'], credentials: true },
})
initSockets(io)

// --- Security & parsing middleware ---
app.use(helmet())
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(parseCookies)
if (!env.NODE_ENV.startsWith('test')) app.use(morgan('dev'))

// --- API ---
app.use('/api', globalLimiter, apiRoutes)

// --- Serve the built frontend in production (same-origin = cookies just work) ---
if (isProd) {
  const clientDir = path.resolve(__dirname, '../../frontend/dist')
  app.use(express.static(clientDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next()
    res.sendFile(path.join(clientDir, 'index.html'))
  })
}

// --- 404 + centralized error handler (must be last) ---
app.use(notFound)
app.use(errorHandler)

httpServer.listen(env.PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🏨 Luxe Grand Hotel Management      ║
  ║   API running on http://localhost:${env.PORT}  ║
  ╚═══════════════════════════════════════╝`)
})

export default app
