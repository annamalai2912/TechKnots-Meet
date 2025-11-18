import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { BrandLogo } from '../components/BrandLogo'
import { useAuth } from '../providers/AuthProvider'
import { createRoom } from '../services/api'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [topic, setTopic] = useState('Daily pulse')
  const [meetingCode, setMeetingCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true })
    }
  }, [navigate, user])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setIsCreating(true)
      const { roomId } = await createRoom(topic || 'TechKnots sync')
      navigate(`/room/${roomId}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoin = (event: FormEvent) => {
    event.preventDefault()
    if (!meetingCode.trim()) return
    navigate(`/room/${meetingCode.trim().toUpperCase()}`)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 4vw' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BrandLogo />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{user?.name}</p>
            <small style={{ color: '#475569' }}>{user?.email}</small>
          </div>
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main
        style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem'
        }}
      >
        <section className="glass" style={{ padding: '2.5rem' }}>
          <div className="badge">Create meeting</div>
          <h2 style={{ marginTop: '1rem' }}>Launch a TechKnots room</h2>
          <p style={{ color: '#475569', maxWidth: 420 }}>
            Start a secure mediasoup-powered space with enterprise-grade encryption, collaborative chat, and
            screen sharing in seconds.
          </p>
          <form onSubmit={handleCreate} className="grid" style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Meeting topic</span>
              <input className="input" value={topic} onChange={(event) => setTopic(event.target.value)} />
            </label>
            <button className="btn" type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create & enter room'}
            </button>
          </form>
        </section>

        <section className="glass" style={{ padding: '2.5rem' }}>
          <div className="badge">Join meeting</div>
          <h2 style={{ marginTop: '1rem' }}>Already have a code?</h2>
          <p style={{ color: '#475569' }}>Enter a meeting code to join instantly from any device.</p>
          <form onSubmit={handleJoin} className="grid" style={{ marginTop: '1.5rem' }}>
            <input
              className="input"
              placeholder="Ex: AB12C3D4E5"
              value={meetingCode}
              onChange={(event) => setMeetingCode(event.target.value.toUpperCase())}
            />
            <button className="btn btn-secondary" type="submit">
              Join room
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

