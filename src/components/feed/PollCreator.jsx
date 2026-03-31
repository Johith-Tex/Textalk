import { useState } from 'react'

export default function PollCreator({ onPollReady, onClear }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions]   = useState(['', ''])
  const [attached, setAttached] = useState(null)
  const [error, setError]       = useState('')

  function addOption() {
    if (options.length >= 4) return
    setOptions([...options, ''])
  }

  function setOption(i, val) {
    const o = [...options]; o[i] = val; setOptions(o)
  }

  function removeOption(i) {
    if (options.length <= 2) return
    setOptions(options.filter((_, idx) => idx !== i))
  }

  function attach() {
    if (!question.trim()) { setError('Add a question.'); return }
    const filled = options.filter(o => o.trim())
    if (filled.length < 2) { setError('Add at least 2 options.'); return }
    const poll = { question: question.trim(), options: filled.map(o => ({ text: o.trim(), votes: [] })) }
    setAttached(poll); onPollReady(poll); setError('')
  }

  function clear() { setQuestion(''); setOptions(['','']); setAttached(null); onClear() }

  if (attached) return (
    <div style={{ marginTop: 10, background: 'var(--bg-hover)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{attached.question}</p>
      {attached.options.map((o, i) => (
        <div key={i} style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '8px 12px', marginBottom: 6, fontSize: 13, color: 'var(--text-2)' }}>{o.text}</div>
      ))}
      <button onClick={clear} style={{ marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>Remove poll</button>
    </div>
  )

  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input className="tx-input" style={{ fontSize: 14, minHeight: 44 }} placeholder="Ask a question…" value={question} onChange={e => setQuestion(e.target.value)} />
      {options.map((o, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="tx-input" style={{ flex: 1, fontSize: 13, minHeight: 42 }} placeholder={`Option ${i + 1}`} value={o} onChange={e => setOption(i, e.target.value)} />
          {options.length > 2 && (
            <button onClick={() => removeOption(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 20, padding: 4, lineHeight: 1 }}>×</button>
          )}
        </div>
      ))}
      {options.length < 4 && (
        <button onClick={addOption} className="btn-ghost" style={{ fontSize: 13, minHeight: 40 }}>+ Add option</button>
      )}
      {error && <p style={{ fontSize: 12, color: '#f87171' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={clear} className="btn-ghost" style={{ flex: 1, fontSize: 13, minHeight: 42 }}>Cancel</button>
        <button onClick={attach} className="btn-primary" style={{ flex: 2, fontSize: 13, minHeight: 42 }}>Attach poll</button>
      </div>
    </div>
  )
}
