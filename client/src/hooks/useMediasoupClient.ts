import { useCallback, useEffect, useRef, useState } from 'react'
import { Device } from 'mediasoup-client'
import type { Socket } from 'socket.io-client'

import { createMeetingSocket } from '../services/socket'
import { useMeetingStore } from '../store/meetingStore'
import type { ChatMessage, UserProfile } from '../types'

interface UseMediasoupOptions {
  roomId?: string
  token: string | null
  user: UserProfile | null
}

interface MediasoupResult {
  isReady: boolean
  isScreenSharing: boolean
  error?: string
  socket?: Socket | null
  toggleAudio: () => void
  toggleVideo: () => void
  shareScreen: () => Promise<void>
  stopShare: () => void
  sendMessage: (text: string) => Promise<void>
  leaveMeeting: () => void
}

type RtpCapabilitiesLike = Record<string, unknown>
type TransportLike = any
type ProducerLike = any
type ConsumerLike = any

const remoteStreams = new Map<string, MediaStream>()

export function useMediasoupClient({ roomId, token, user }: UseMediasoupOptions): MediasoupResult {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string>()
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const deviceRef = useRef<Device | null>(null)
  const sendTransportRef = useRef<TransportLike | null>(null)
  const recvTransportRef = useRef<TransportLike | null>(null)
  const videoProducerRef = useRef<ProducerLike | null>(null)
  const audioProducerRef = useRef<ProducerLike | null>(null)
  const consumersRef = useRef<Map<string, ConsumerLike>>(new Map())
  const screenTrackRef = useRef<MediaStreamTrack | null>(null)
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null)

  const cleanup = useCallback(() => {
    sendTransportRef.current?.close()
    recvTransportRef.current?.close()
    videoProducerRef.current?.close()
    audioProducerRef.current?.close()

    const { localStream, setLocalStream, reset } = useMeetingStore.getState()
    localStream?.getTracks().forEach((track) => track.stop())
    setLocalStream(undefined)

    remoteStreams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()))
    remoteStreams.clear()

    consumersRef.current.forEach((consumer) => consumer.close())
    consumersRef.current.clear()

    reset()
    if (screenTrackRef.current) {
      screenTrackRef.current.stop()
      screenTrackRef.current = null
    }
    setIsScreenSharing(false)
  }, [])

  const handleNewMessage = useCallback((message: ChatMessage) => {
    useMeetingStore.getState().addMessage(message)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!socketRef.current || !text.trim()) return

      await new Promise<void>((resolve, reject) => {
        socketRef.current?.emit('sendMessage', { text }, (response: { error?: string }) => {
          if (response?.error) {
            reject(new Error(response.error))
          } else {
            resolve()
          }
        })
      })
    },
    []
  )

  const createTransport = useCallback(
    async (direction: 'send' | 'recv') => {
      return new Promise<TransportLike>((resolve, reject) => {
        socketRef.current?.emit('createTransport', { direction }, async (response: any) => {
          if (response?.error) {
            reject(new Error(response.error))
            return
          }

          try {
            const device = deviceRef.current
            if (!device) {
              reject(new Error('Device not initialized'))
              return
            }

            const transport =
              direction === 'send'
                ? device.createSendTransport(response)
                : device.createRecvTransport(response)

            transport.on('connect', ({ dtlsParameters }, callback, errback) => {
              socketRef.current?.emit(
                'connectTransport',
                { transportId: response.id, dtlsParameters },
                (ack: { error?: string }) => {
                  if (ack?.error) {
                    errback(new Error(ack.error))
                    return
                  }
                  callback()
                }
              )
            })

            if (direction === 'send') {
              transport.on('produce', ({ kind, rtpParameters }, callback, errback) => {
                socketRef.current?.emit(
                  'produce',
                  { transportId: response.id, kind, rtpParameters },
                  (ack: { error?: string; id?: string }) => {
                    if (ack?.error || !ack?.id) {
                      errback(new Error(ack?.error || 'produce failed'))
                      return
                    }
                    callback({ id: ack.id })
                  }
                )
              })
            }

            resolve(transport)
          } catch (err) {
            reject(err)
          }
        })
      })
    },
    []
  )

  const consumeProducer = useCallback(
    async (producerId: string, peerId: string, peerUser?: UserProfile) => {
      const device = deviceRef.current
      const transport = recvTransportRef.current

      if (!device || !transport) return

      await new Promise<void>((resolve, reject) => {
        socketRef.current?.emit(
          'consume',
          { producerId, rtpCapabilities: device.rtpCapabilities },
          async (response: any) => {
            if (response?.error) {
              reject(new Error(response.error))
              return
            }

            try {
              const consumer = await transport.consume({
                id: response.id,
                producerId: response.producerId,
                kind: response.kind,
                rtpParameters: response.rtpParameters
              })

              consumersRef.current.set(consumer.id, consumer)

              const existingStream = remoteStreams.get(peerId) ?? new MediaStream()
              existingStream.addTrack(consumer.track)
              remoteStreams.set(peerId, existingStream)

              useMeetingStore.getState().upsertParticipant({
                id: peerId,
                user: peerUser ?? { id: peerId, name: 'Guest', email: '' },
                stream: existingStream,
                audioEnabled: true,
                videoEnabled: true,
                isSelf: peerId === socketRef.current?.id
              })

              socketRef.current?.emit('resumeConsumer', { consumerId: consumer.id })
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        )
      })
    },
    []
  )

  const publishLocalStream = useCallback(
    async (stream: MediaStream) => {
      const sendTransport = sendTransportRef.current
      if (!sendTransport) return

      const tracks = stream.getTracks()
      await Promise.all(
        tracks.map(async (track) => {
          const producer = await sendTransport.produce({ track })
          if (track.kind === 'video') {
            videoProducerRef.current = producer
            cameraTrackRef.current = track
          } else {
            audioProducerRef.current = producer
          }
        })
      )
    },
    []
  )

  useEffect(() => {
    if (!roomId || !token || !user) return

    const activeRoomId = roomId
    const socket = createMeetingSocket(token, activeRoomId)
    socketRef.current = socket
    useMeetingStore.getState().setRoomId(activeRoomId)
    setIsReady(false)
    setError(undefined)

    const handleRoomJoined = async (
      participantsFromEvent: Array<{ id: string; user: UserProfile }>,
      joinData: {
        rtpCapabilities: RtpCapabilitiesLike
        existingProducers: Array<{ producerId: string; peerId: string; user?: UserProfile }>
        chatHistory: ChatMessage[]
      }
    ) => {
      try {
        const { rtpCapabilities, existingProducers, chatHistory } = joinData
        const participants = participantsFromEvent ?? []
        const device = new Device()
        await device.load({ routerRtpCapabilities: rtpCapabilities })
        deviceRef.current = device

        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })

        // Restore saved audio/video state from localStorage
        const savedAudioEnabled = localStorage.getItem('meeting_audioEnabled')
        const savedVideoEnabled = localStorage.getItem('meeting_videoEnabled')
        const audioEnabled = savedAudioEnabled !== null ? savedAudioEnabled === 'true' : true
        const videoEnabled = savedVideoEnabled !== null ? savedVideoEnabled === 'true' : true

        // Apply saved state to tracks
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = audioEnabled
        })
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = videoEnabled
        })

        const store = useMeetingStore.getState()
        const selfId = socket.id ?? socketRef.current?.id ?? 'self'
        store.setLocalStream(localStream)
        store.upsertParticipant({
          id: selfId,
          user,
          stream: localStream,
          audioEnabled,
          videoEnabled,
          isSelf: true
        })

        participants
          .filter((p) => p.id !== selfId)
          .forEach((p) =>
            useMeetingStore.getState().upsertParticipant({
              id: p.id,
              user: p.user,
              audioEnabled: true,
              videoEnabled: true,
              isSelf: false
            })
          )

        chatHistory.forEach((message) => useMeetingStore.getState().addMessage(message))

        sendTransportRef.current = await createTransport('send')
        recvTransportRef.current = await createTransport('recv')

        await publishLocalStream(localStream)

        await Promise.all(
          existingProducers.map(({ producerId, peerId, user: producerUser }) =>
            consumeProducer(producerId, peerId, producerUser)
          )
        )

        setIsReady(true)
      } catch (err) {
        console.error(err) // eslint-disable-line no-console
        setError(err instanceof Error ? err.message : 'Unable to join room')
      }
    }

    socket.on('room:joined', (payload: { participants: Array<{ id: string; user: UserProfile }> }) => {
      const participantsFromEvent = payload?.participants ?? []
      socket.emit('joinRoom', {}, (joinData: {
        rtpCapabilities: RtpCapabilitiesLike
        existingProducers: Array<{ producerId: string; peerId: string; user?: UserProfile }>
        chatHistory: ChatMessage[]
      }) => handleRoomJoined(participantsFromEvent, joinData))
    })

    socket.on('room:participant-joined', ({ id, user: joinedUser }) => {
      useMeetingStore.getState().upsertParticipant({
        id,
        user: joinedUser,
        audioEnabled: true,
        videoEnabled: true,
        isSelf: id === socket.id
      })
    })

    socket.on('newProducer', ({ producerId, peerId, user: producerUser }) => {
      consumeProducer(producerId, peerId, producerUser)
    })

    socket.on('room:participant-left', ({ id }) => {
      useMeetingStore.getState().removeParticipant(id)
      const stream = remoteStreams.get(id)
      stream?.getTracks().forEach((track) => track.stop())
      remoteStreams.delete(id)
    })

    socket.on('chat:new-message', handleNewMessage)

    socket.on('disconnect', () => {
      setIsReady(false)
      cleanup()
    })

    return () => {
      socket.disconnect()
      cleanup()
    }
  }, [cleanup, consumeProducer, createTransport, handleNewMessage, publishLocalStream, roomId, token, user])

  const toggleAudio = useCallback(() => {
    const store = useMeetingStore.getState()
    const localStream = store.localStream
    if (!localStream) return

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled
    })

    const peerId = socketRef.current?.id
    const participant = peerId ? store.participants[peerId] : undefined
    if (participant) {
      const isEnabled = localStream.getAudioTracks().every((track) => track.enabled)
      store.upsertParticipant({ ...participant, audioEnabled: isEnabled })
      // Save state to localStorage
      localStorage.setItem('meeting_audioEnabled', String(isEnabled))
    }
  }, [])

  const toggleVideo = useCallback(() => {
    const store = useMeetingStore.getState()
    const localStream = store.localStream
    if (!localStream) return

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled
    })

    const peerId = socketRef.current?.id
    const participant = peerId ? store.participants[peerId] : undefined
    if (participant) {
      const isEnabled = localStream.getVideoTracks().every((track) => track.enabled)
      store.upsertParticipant({ ...participant, videoEnabled: isEnabled })
      // Save state to localStorage
      localStorage.setItem('meeting_videoEnabled', String(isEnabled))
    }
  }, [])

  const shareScreen = useCallback(async () => {
    if (screenTrackRef.current) return

    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
    const [screenTrack] = screenStream.getVideoTracks()

    if (!screenTrack) return

    screenTrackRef.current = screenTrack
    setIsScreenSharing(true)

    if (videoProducerRef.current) {
      await videoProducerRef.current.replaceTrack({ track: screenTrack })
    }

    screenTrack.onended = () => {
      screenTrackRef.current = null
      setIsScreenSharing(false)
      if (cameraTrackRef.current) {
        videoProducerRef.current?.replaceTrack({ track: cameraTrackRef.current })
      }
    }
  }, [])

  const stopShare = useCallback(() => {
    if (!screenTrackRef.current) return
    screenTrackRef.current.stop()
    screenTrackRef.current = null
    setIsScreenSharing(false)
    if (cameraTrackRef.current) {
      videoProducerRef.current?.replaceTrack({ track: cameraTrackRef.current })
    }
  }, [])

  const leaveMeeting = useCallback(() => {
    socketRef.current?.emit('leaveRoom')
    socketRef.current?.disconnect()
    cleanup()
  }, [cleanup])

  return {
    isReady,
    isScreenSharing,
    error,
    socket: socketRef.current,
    toggleAudio,
    toggleVideo,
    shareScreen,
    stopShare,
    sendMessage,
    leaveMeeting
  }
}

