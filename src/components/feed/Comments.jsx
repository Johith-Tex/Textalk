import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { subscribeToComments, addComment, deleteComment } from '../../firebase/comments'

function timeAgo(ts) {
  if (!ts) return ''
  const sec = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec/60)}m`
  return `${Math.floor(sec/3600)}h`
}

export default function Comments({ postId, onClose }) {
  const { currentUser } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    return subscribeToComments(postId, setComments)
  }, [postId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  async function submit(e) {
    e.preventDefault()
    if (!text.trim() || !currentUser) return
    setSending(true)
    await addComment(postId, currentUser.uid, currentUser.displayName || 'User', text.trim())
    setText(''); setSending(false); inputRef.current?.focus()
  }

  const accentColors = ['#1D9E75','#378ADD','#D85A30','#7F77DD','#D4537E','#EF9F27']
  const colorFor = name => accentColors[(name||'U').charCodeAt(0) % accentColors.length]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1500, display: 'flex', alignItems: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="anim-slideUp" style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}>
        {/* Handle */}
        <div style={{ padding: '12px 20px 10px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-h)', margin: '0 auto 0 auto', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 12 }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, flex: 1, textAlign: 'center' }}>Comments · {comments.length}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 20, padding: 4, lineHeight: 1 }}>×</button>
        </div>

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {comments.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '24px 0' }}>No comments yet — be first!</p>
          )}
          {comments.map(c => {
            const col = colorFor(c.username)
            return (
              <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${col}22`, border: `1.5px solid ${col}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: col, flexShrink: 0, marginTop: 2 }}>
                  {(c.username||'U').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.username}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{timeAgo(c.createdAt)}</span>
                    {c.userId === currentUser?.uid && (
                      <button onClick={() => deleteComment(postId, c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 11, marginLeft: 'auto', padding: 2 }}>Delete</button>
                    )}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.5, marginTop: 3, color: 'var(--text-1)', wordBreak: 'break-word', direction: 'ltr', textAlign: 'left' }}>{c.text}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={submit} style={{ padding: '10px 16px 32px', borderTop: '0.5px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input ref={inputRef} className="tx-input" style={{ flex: 1, fontSize: 14, direction: 'ltr' }} placeholder="Write a comment…" value={text} onChange={e => setText(e.target.value)} dir="ltr" />
          <button type="submit" disabled={sending || !text.trim()} className="btn-primary" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, padding: 0, minHeight: 44 }}>
            {sending ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>}
          </button>
        </form>
      </div>
    </div>
  )
}
