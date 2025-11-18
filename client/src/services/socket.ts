import { io, Socket } from 'socket.io-client'

// In production, use relative URLs since client and server are on same domain
// In development, use the explicit server URL
const serverUrl = import.meta.env.PROD
  ? (import.meta.env.VITE_SERVER_URL || window.location.origin)
  : (import.meta.env.VITE_SERVER_URL || 'http://localhost:4000')

export function createMeetingSocket(token: string, roomId: string): Socket {
  return io(serverUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token },
    query: { roomId }
  })
}

