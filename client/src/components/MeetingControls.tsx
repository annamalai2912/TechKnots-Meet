import { Copy, Check, Mic, MicOff, PhoneOff, ScreenShare, ScreenShareOff, Video, VideoOff } from 'lucide-react'
import { useState } from 'react'

interface MeetingControlsProps {
  roomId: string
  isScreenSharing: boolean
  audioEnabled: boolean
  videoEnabled: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onShareScreen: () => void
  onStopShare: () => void
  onLeave: () => void
}

const iconButtonStyle: React.CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: '50%',
  border: 'none',
  display: 'grid',
  placeItems: 'center',
  fontSize: '1.15rem',
  background: 'rgba(4, 120, 87, 0.12)',
  color: '#064e3b',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, opacity 0.2s ease'
}

export function MeetingControls({
  roomId,
  isScreenSharing,
  audioEnabled,
  videoEnabled,
  onLeave,
  onShareScreen,
  onStopShare,
  onToggleAudio,
  onToggleVideo
}: MeetingControlsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div
      className="glass"
      style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>Meeting code</p>
          <strong style={{ letterSpacing: 4 }}>{roomId}</strong>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            display: 'grid',
            placeItems: 'center',
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(4, 120, 87, 0.12)',
            color: copied ? '#047857' : '#064e3b',
            cursor: 'pointer',
            transition: 'background 0.2s ease, transform 0.2s ease'
          }}
          aria-label="Copy meeting code"
          title={copied ? 'Copied!' : 'Copy meeting code'}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
        <button
          type="button"
          style={{
            ...iconButtonStyle,
            background: audioEnabled ? 'rgba(4, 120, 87, 0.12)' : 'rgba(239, 68, 68, 0.15)',
            color: audioEnabled ? '#064e3b' : '#b91c1c'
          }}
          onClick={onToggleAudio}
          aria-label="Toggle audio"
        >
          {audioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
        <button
          type="button"
          style={{
            ...iconButtonStyle,
            background: videoEnabled ? 'rgba(4, 120, 87, 0.12)' : 'rgba(239, 68, 68, 0.15)',
            color: videoEnabled ? '#064e3b' : '#b91c1c'
          }}
          onClick={onToggleVideo}
          aria-label="Toggle video"
        >
          {videoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
        {isScreenSharing ? (
          <button
            type="button"
            style={{ ...iconButtonStyle, background: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c' }}
            onClick={onStopShare}
          >
            <ScreenShareOff size={22} />
          </button>
        ) : (
          <button type="button" style={iconButtonStyle} onClick={onShareScreen}>
            <ScreenShare size={22} />
          </button>
        )}
        <button
          type="button"
          style={{ ...iconButtonStyle, background: '#ef4444', color: '#fff' }}
          onClick={onLeave}
        >
          <PhoneOff size={22} />
        </button>
      </div>
    </div>
  )
}

