import type { Server } from 'socket.io'

// Holds the Socket.io server instance so any module can emit without
// importing app.ts (which would create a circular dependency).
let io: Server | null = null

export function setIo(server: Server): void {
  io = server
}

const STAFF_ROOM = 'staff'

/** Emit an event to all connected staff dashboards. */
export function emitToStaff(event: string, payload: unknown): void {
  io?.to(STAFF_ROOM).emit(event, payload)
}

export { STAFF_ROOM }
