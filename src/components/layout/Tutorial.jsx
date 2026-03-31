import { useState, useEffect } from 'react'

const STEPS = [
  {
    title: 'Welcome to Textalk!',
    desc: 'A quick tour to get you started. Takes about 30 seconds.',
    target: null,
  },
  {
    title: 'Your feed',
    desc: 'Post text, photos, videos, or songs. Everyone on Textalk sees your posts in real time.',
    target: null,
  },
  {
    title: 'Messages',
    desc: 'Tap Messages in the bottom bar to chat live with any user. Supports GIFs and stickers.',
    target: null,
  },
  {
    title: 'People',
    desc: 'Find and add friends. Tap any user to see their profile card and send a request.',
    target: null,
  },
  {
    title: "You're all set!",
    desc: "Textalk is free and open source. Reopen this guide anytime from your Profile page.",
    target: null,
  },
]

export default function Tutorial({ onClose }) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1

  return (
    <>
      <div
        className="tutorial-overlay"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      />

      {/* Card — always centred, no dynamic positioning */}
      <div
        className="tutorial-card"
        key={step}
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i === step ? 'var(--accent)' : 'var(--border-h)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Step counter */}
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>
          STEP {step + 1} OF {STEPS.length}
        </p>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--text-1)', lineHeight: 1.3 }}>
          {STEPS[step].title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 20 }}>
          {STEPS[step].desc}
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '10px 0', fontSize: 14, minHeight: 44 }}>
              Back
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => isLast ? onClose() : setStep(s => s + 1)}
            style={{ flex: 2, padding: '10px 0', fontSize: 14, minHeight: 44 }}
          >
            {isLast ? 'Get started' : 'Next →'}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button onClick={onClose} style={{ display: 'block', margin: '12px auto 0', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-body)' }}>
            Skip tutorial
          </button>
        )}
      </div>
    </>
  )
}
