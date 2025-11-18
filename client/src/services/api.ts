import axios from 'axios'

const baseURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

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

