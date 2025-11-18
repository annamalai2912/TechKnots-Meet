import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquare, X } from 'lucide-react'

import { ChatPanel } from '../components/ChatPanel'
import { MeetingControls } from '../components/MeetingControls'
import { ParticipantTile } from '../components/ParticipantTile'
import { useMediasoupClient } from '../hooks/useMediasoupClient'
import { useAuth } from '../providers/AuthProvider'
import { useMeetingStore } from '../store/meetingStore'

export function RoomPage() {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const meetingStore = useMeetingStore()
  const [isChatOpen, setIsChatOpen] = useState(false)

  const {
    isReady,
    error,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    shareScreen,
    stopShare,
    sendMessage,
    leaveMeeting
  } =
    useMediasoupClient({
      roomId,
      token,
      user
    })

  useEffect(() => {
    if (!token || !user) {
      navigate('/', { replace: true })
    }
  }, [navigate, token, user])

  const handleShareScreen = async () => {
    await shareScreen()
  }

  const handleStopShare = () => {
    stopShare()
  }

  const handleLeave = () => {
    leaveMeeting()
    navigate('/dashboard')
  }

  const participantList = Object.values(meetingStore.participants)
  const localParticipant = participantList.find((participant) => participant.isSelf)

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', display: 'grid', gap: '1.5rem' }}>
      {error && (
        <div className="card" style={{ border: '1px solid #f87171', color: '#b91c1c' }}>
          <strong>Connection issue</strong>
          <p>{error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isChatOpen ? '1fr minmax(320px, 360px)' : '1fr', gap: '1.5rem', position: 'relative' }}>
        <section
          className="glass"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            minHeight: '70vh'
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>TechKnots Room</h2>
              <p style={{ margin: 0, color: '#475569' }}>Collaborate in real time with your team.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="badge">{participantList.length} participants</div>
              {!isChatOpen && (
                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: 'none',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(4, 120, 87, 0.12)',
                    color: '#064e3b',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, opacity 0.2s ease'
                  }}
                  aria-label="Open chat"
                >
                  <MessageSquare size={22} />
                </button>
              )}
            </div>
          </header>

          {!isReady && (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#475569' }}>
              Connecting to mediasoup mesh&hellip;
            </div>
          )}

          {isReady && (
            <div className="video-grid">
              {participantList.map((participant) => (
                <ParticipantTile key={participant.id} participant={participant} />
              ))}
            </div>
          )}
        </section>

        {isChatOpen && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 10,
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(15, 23, 42, 0.1)',
                color: '#0f172a',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, opacity 0.2s ease'
              }}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
            <ChatPanel onSendMessage={sendMessage} />
          </div>
        )}
      </div>

      <MeetingControls
        roomId={roomId}
        isScreenSharing={isScreenSharing}
        audioEnabled={localParticipant?.audioEnabled ?? true}
        videoEnabled={localParticipant?.videoEnabled ?? true}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onShareScreen={handleShareScreen}
        onStopShare={handleStopShare}
        onLeave={handleLeave}
      />
    </div>
  )
}






