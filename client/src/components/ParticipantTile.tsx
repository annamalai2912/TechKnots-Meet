import { useEffect, useRef } from 'react'
import { MicOff } from 'lucide-react'

import type { Participant } from '../types'

interface ParticipantTileProps {
  participant: Participant
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream
      if (participant.isSelf) {
        videoRef.current.muted = true
      }
      void videoRef.current.play()
    }
  }, [participant.stream, participant.isSelf])

  const initials = participant.user.name
    .split(' ')
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase()

  return (
    <div className="video-tile">
      {participant.stream ? (
        <video ref={videoRef} autoPlay playsInline muted={participant.isSelf} />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontSize: '2rem',
            fontWeight: 600,
            color: '#fffff0'
          }}
        >
          {initials}
        </div>
      )}

      <div className="meta">
        <span>{participant.user.name}</span>
        {!participant.audioEnabled && <MicOff size={16} />}
      </div>
    </div>
  )
}

