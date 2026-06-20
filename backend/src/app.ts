import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Luxe Grand Hotel Management API',
    version: '1.0.0',
  })
})

// Routes will be added here by Claude Code
// import authRoutes from './routes/auth'
// import bookingRoutes from './routes/bookings'
// import roomRoutes from './routes/rooms'
// import guestRoutes from './routes/guests'
// import analyticsRoutes from './routes/analytics'
// import staffRoutes from './routes/staff'
// app.use('/api/auth', authRoutes)
// app.use('/api/bookings', bookingRoutes)
// app.use('/api/rooms', roomRoutes)
// app.use('/api/guests', guestRoutes)
// app.use('/api/analytics', analyticsRoutes)
// app.use('/api/staff', staffRoutes)

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  socket.on('join-hotel', (hotelId: string) => {
    socket.join(`hotel-${hotelId}`)
    console.log(`📡 Client joined hotel room: hotel-${hotelId}`)
  })

  socket.on('room-status-update', (data) => {
    io.to(`hotel-${data.hotelId}`).emit('room-updated', data)
  })

  socket.on('new-booking', (data) => {
    io.to(`hotel-${data.hotelId}`).emit('booking-created', data)
  })

  socket.on('task-update', (data) => {
    io.to(`hotel-${data.hotelId}`).emit('task-updated', data)
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.message)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🏨 Luxe Grand Hotel Management     ║
  ║   API Server running on port ${PORT}   ║
  ╚═══════════════════════════════════════╝
  `)
})

export default app
