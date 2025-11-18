import { io, Socket } from 'socket.io-client'

// In production, use relative URLs since client and server are on same domain
// In development, use the explicit server URL
let serverUrl = import.meta.env.PROD
  ? (import.meta.env.VITE_SERVER_URL || window.location.origin)
  : (import.meta.env.VITE_SERVER_URL || 'http://localhost:4000')

// Runtime check: if serverUrl contains localhost and we're on a remote domain, use current origin
// This fixes the case where the build had localhost baked in
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
if (isProduction && serverUrl && (serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1'))) {
  console.warn('⚠️ Detected localhost URL in production build, switching to current origin')
  console.warn('Original serverUrl:', serverUrl, '→ Using:', window.location.origin)
  serverUrl = window.location.origin
}

export function createMeetingSocket(token: string, roomId: string): Socket {
  return io(serverUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token },
    query: { roomId }
  })
}

