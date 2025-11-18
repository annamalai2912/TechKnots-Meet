import axios from 'axios'

// In production, always use relative URLs (same domain)
// In development, use the explicit server URL
let baseURL = import.meta.env.PROD 
  ? (import.meta.env.VITE_SERVER_URL || '') 
  : (import.meta.env.VITE_SERVER_URL || 'http://localhost:4000')

// Runtime check: if baseURL contains localhost and we're on a remote domain, use relative URL
// This fixes the case where the build had localhost baked in
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
if (isProduction && baseURL && (baseURL.includes('localhost') || baseURL.includes('127.0.0.1'))) {
  console.warn('⚠️ Detected localhost URL in production build, switching to relative URLs')
  console.warn('Original baseURL:', baseURL, '→ Using relative URLs')
  baseURL = ''
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export async function createRoom(topic: string) {
  const response = await api.post('/api/rooms', { topic })
  return response.data
}

export async function getRoom(roomId: string) {
  const response = await api.get(`/api/rooms/${roomId}`)
  return response.data
}

export async function authenticateWithGoogle(credential: string) {
  const response = await api.post('/api/auth/google', { credential })
  return response.data
}

