export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface AuthSession {
  token: string
  user: UserProfile
}

export interface MeetingMeta {
  roomId: string
  topic: string
  hostId: string
  createdAt: number
}

export interface ChatMessage {
  id: string
  text: string
  timestamp: number
  sender: UserProfile
}

export interface Participant {
  id: string
  user: UserProfile
  stream?: MediaStream
  audioEnabled: boolean
  videoEnabled: boolean
  isSpeaking?: boolean
  isSelf: boolean
}

