import { io, type Socket } from 'socket.io-client'
import { getAccessToken } from './authToken'

let socket: Socket | null = null

/** Connect (or reconnect) the socket with the current access token. */
export function connectSocket(): Socket {
  if (socket) {
    socket.auth = { token: getAccessToken() }
    if (!socket.connected) socket.connect()
    return socket
  }
  socket = io({
    autoConnect: true,
    auth: { token: getAccessToken() },
  })
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}
