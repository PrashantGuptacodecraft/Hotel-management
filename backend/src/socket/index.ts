import type { Server, Socket } from 'socket.io'
import { verifyAccessToken } from '../lib/jwt'
import { STAFF_ROLES, type UserRole } from '../lib/enums'
import { setIo, STAFF_ROOM } from './io'

/**
 * Authenticate each socket from the access token in the handshake, and put
 * staff members into the shared `staff` room so they receive live updates.
 */
export function initSockets(io: Server): void {
  setIo(io)

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) return next() // allow anonymous connect; just no staff room
    try {
      const payload = verifyAccessToken(token)
      socket.data.user = { id: payload.sub, role: payload.role }
    } catch {
      /* invalid token — treated as anonymous */
    }
    next()
  })

  io.on('connection', (socket: Socket) => {
    const role = socket.data.user?.role as UserRole | undefined
    if (role && STAFF_ROLES.includes(role)) {
      socket.join(STAFF_ROOM)
    }
    socket.on('disconnect', () => {
      /* no-op */
    })
  })
}
