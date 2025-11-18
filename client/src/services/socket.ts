import { io, Socket } from 'socket.io-client'

const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

export function createMeetingSocket(token: string, roomId: string): Socket {
  return io(serverUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token },
    query: { roomId }
  })
}

