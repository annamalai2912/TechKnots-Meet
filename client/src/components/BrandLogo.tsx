export function BrandLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #064e3b, #10b981)',
          display: 'grid',
          placeItems: 'center',
          color: '#fffff0',
          fontWeight: 700,
          fontSize: size * 0.4
        }}
      >
        T
      </div>
      <div>
        <div style={{ fontSize: size * 0.6, fontWeight: 700, color: '#064e3b' }}>TechKnots</div>
        <div style={{ fontSize: size * 0.35, letterSpacing: 2, textTransform: 'uppercase', color: '#10b981' }}>
          Meet
        </div>
      </div>
    </div>
  )
}

