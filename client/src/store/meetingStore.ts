import { create } from 'zustand'

import type { ChatMessage, Participant } from '../types'

interface MeetingState {
  roomId: string | null
  participants: Record<string, Participant>
  messages: ChatMessage[]
  localStream?: MediaStream
  setRoomId: (roomId: string | null) => void
  upsertParticipant: (participant: Participant) => void
  removeParticipant: (participantId: string) => void
  setParticipantStream: (participantId: string, stream: MediaStream | undefined) => void
  setLocalStream: (stream?: MediaStream) => void
  addMessage: (message: ChatMessage) => void
  reset: () => void
}

export const useMeetingStore = create<MeetingState>((set) => ({
  roomId: null,
  participants: {},
  messages: [],
  localStream: undefined,
  setRoomId: (roomId) => set(() => ({ roomId })),
  upsertParticipant: (participant) =>
    set((state) => ({
      participants: {
        ...state.participants,
        [participant.id]: {
          ...state.participants[participant.id],
          ...participant
        }
      }
    })),
  removeParticipant: (participantId) =>
    set((state) => {
      const next = { ...state.participants }
      delete next[participantId]
      return { participants: next }
    }),
  setParticipantStream: (participantId, stream) =>
    set((state) => {
      const participant = state.participants[participantId]
      if (!participant) return {}
      return {
        participants: {
          ...state.participants,
          [participantId]: {
            ...participant,
            stream
          }
        }
      }
    }),
  setLocalStream: (stream) => set(() => ({ localStream: stream })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    })),
  reset: () =>
    set(() => ({
      roomId: null,
      participants: {},
      messages: [],
      localStream: undefined
    }))
}))

