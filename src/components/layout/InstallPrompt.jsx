import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [shown, setShown]   = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      setPrompt(e)
      setTimeout(() => setShown(true), 3000)
    })
  }, [])

  if (!shown || !prompt) return null

  return (
    <div className="anim-slideUp" style={{
      position: 'fixed', bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 12px)',
      left: 16, right: 16, zIndex: 200,
      background: 'var(--bg-card)', border: '1px solid var(--accent)',
      borderRadius: 16, padding: '16px 18px',
      boxShadow: '0 -4px 32px rgba(29,158,117,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Install Textalk</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Add to home screen for the best experience</p>
        </div>
        <button onClick={() => setShown(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={() => setShown(false)} className="btn-ghost" style={{ flex: 1, padding: '9px 0', fontSize: 13, minHeight: 40 }}>Not now</button>
        <button onClick={async () => { await prompt.prompt(); setShown(false) }} className="btn-primary" style={{ flex: 2, padding: '9px 0', fontSize: 13, minHeight: 40 }}>
          Install app
        </button>
      </div>
    </div>
  )
}
