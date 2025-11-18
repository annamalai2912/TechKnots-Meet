import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'

import { BrandLogo } from '../components/BrandLogo'
import { useAuth } from '../providers/AuthProvider'
import { authenticateWithGoogle, setAuthToken } from '../services/api'

export function LandingPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return

    const session = await authenticateWithGoogle(credentialResponse.credential)
    login(session)
    setAuthToken(session.token)
    navigate('/dashboard', { replace: true })
  }

  const handleError = () => {
    alert('Unable to sign in with Google. Please try again.')
  }

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, user])

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 4vw' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BrandLogo />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" type="button">
            Product Tour
          </button>
          <button className="btn" type="button">
            Contact Sales
          </button>
        </div>
      </header>

      <main
        style={{
          marginTop: '4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}
      >
        <div>
          <div className="badge">TechKnots Meet</div>
          <h1 style={{ fontSize: '3.2rem', marginBottom: '1rem', marginTop: '1.5rem' }}>
            Elevate every conversation with <span className="text-emerald">emerald-grade</span> clarity.
          </h1>
          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: 540 }}>
            Bring teams together with our Mediasoup-powered Meet experience—engineered for secure, lifelike
            meetings, screen sharing, and deep collaboration.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 320 }}>
            <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
            <small style={{ color: '#475569' }}>
              Sign in with Google to launch your TechKnots workspace instantly.
            </small>
          </div>
        </div>

        <section className="glass" style={{ padding: '2rem', position: 'relative' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {[
              { stat: '120 ms', label: 'Ultra-low latency media relays' },
              { stat: '4K', label: 'Crystal video & adaptive bitrates' },
              { stat: 'ISO 27001', label: 'Enterprise-grade security' }
            ].map((feature) => (
              <div key={feature.stat} className="card" style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '1.75rem', color: '#047857' }}>{feature.stat}</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#475569' }}>{feature.label}</p>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(4,120,87,0.12), rgba(16,185,129,0.18))'
            }}
          >
            <h3 style={{ marginTop: 0 }}>Seamless enterprise-grade rooms</h3>
            <p style={{ color: '#475569' }}>
              Mediasoup SFU ensures every participant gets an optimized stream. TechKnots orchestrates
              adaptive video layers, crisp audio, and collaborative chat out of the box.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

