import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { getChatId, sendMessage, subscribeToChat } from '../../firebase/realtime'
import MediaPicker from './MediaPicker'

function timeStr(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
}

function MessageBubble({ msg, isMe }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError]   = useState(false)
  const body = msg.content || msg.text || ''

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMe ? 'flex-end' : 'flex-start',
      marginBottom: 2,
    }}>
      {/* Sender name for received messages */}
      {!isMe && msg.type !== 'sticker' && (
        <p style={{
          fontSize: 10, color: 'var(--text-3)',
          marginBottom: 3, marginLeft: 4,
          textAlign: 'left',
          direction: 'ltr',
        }}>
          {msg.senderName}
        </p>
      )}

      {/* Text bubble */}
      {(msg.type === 'text' || !msg.type) && (
        <div className="anim-msgIn" style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isMe ? 'var(--accent)' : 'var(--bg-card)',
          border: isMe ? 'none' : '1px solid var(--border)',
          direction: 'ltr',
          textAlign: 'left',
        }}>
          <p style={{
            fontSize: 14, lineHeight: 1.55,
            wordBreak: 'break-word', wordWrap: 'break-word',
            overflowWrap: 'break-word',
            color: isMe ? 'white' : 'var(--text-1)',
            whiteSpace: 'pre-wrap',
            direction: 'ltr',
            textAlign: 'left',
            unicodeBidi: 'plaintext',
          }}>
            {body}
          </p>
          <p style={{
            fontSize: 10, opacity: 0.6, marginTop: 4,
            textAlign: 'right', color: isMe ? 'white' : 'var(--text-2)',
          }}>
            {timeStr(msg.timestamp)}
          </p>
        </div>
      )}

      {/* Sticker */}
      {msg.type === 'sticker' && (
        <div className="anim-msgIn" style={{ textAlign: isMe ? 'right' : 'left' }}>
          <span style={{ fontSize: 52, display: 'block', lineHeight: 1.2 }}>{body}</span>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>{timeStr(msg.timestamp)}</p>
        </div>
      )}

      {/* GIF */}
      {msg.type === 'gif' && (
        <div className="anim-msgIn">
          {!imgError ? (
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', maxWidth: 240 }}>
              {!imgLoaded && <div className="skeleton" style={{ width: 240, height: 135 }} />}
              <img src={body} alt="gif"
                style={{ width: '100%', display: imgLoaded ? 'block' : 'none', borderRadius: 14 }}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            </div>
          ) : <p style={{ fontSize: 13, color: 'var(--text-3)' }}>🎬 GIF unavailable</p>}
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>{timeStr(msg.timestamp)}</p>
        </div>
      )}
    </div>
  )
}

export default function ChatWindow() {
  const { currentUser } = useAuth()
  const [users, setUsers]           = useState([])
  const [selected, setSelected]     = useState(null)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [loadingUsers, setLoading]  = useState(true)
  const [view, setView]             = useState('list')
  const bottomRef = useRef(null)
  const pickerRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    if (!currentUser) return
    return onSnapshot(collection(db, 'users'), snap => {
      const list = snap.docs.map(d => d.data()).filter(u => u.uid !== currentUser.uid)
      setUsers(list)
      setLoading(false)
    }, err => { console.error('users:', err.code); setLoading(false) })
  }, [currentUser])

  useEffect(() => {
    if (!selected || !currentUser) return
    setMessages([])
    const chatId = getChatId(currentUser.uid, selected.uid)
    return subscribeToChat(chatId, msgs =>
      setMessages([...msgs].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)))
    )
  }, [selected?.uid, currentUser?.uid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    function close(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function openChat(user) {
    setSelected(user)
    setView('chat')
    setMessages([])
  }

  async function handleSend(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || !selected || sending) return
    setSending(true)
    try {
      await sendMessage(getChatId(currentUser.uid, selected.uid), currentUser.uid, currentUser.displayName || 'User', text, 'text')
      setInput('')
      inputRef.current?.focus()
    } catch (err) { console.error(err) }
    finally { setSending(false) }
  }

  async function handleMedia({ type, content }) {
    if (!selected) return
    await sendMessage(getChatId(currentUser.uid, selected.uid), currentUser.uid, currentUser.displayName || 'User', content, type)
    setShowPicker(false)
  }

  const accentColors = ['#1D9E75','#378ADD','#D85A30','#7F77DD','#D4537E','#EF9F27']
  const colorFor = name => accentColors[(name || 'U').charCodeAt(0) % accentColors.length]

  if (view === 'list') return (
    <div style={{ height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {loadingUsers && [1,2,3].map(i => (
        <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 160, height: 12 }} />
          </div>
        </div>
      ))}

      {!loadingUsers && users.length === 0 && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
            No other users yet.<br/>Share Textalk with friends!
          </p>
        </div>
      )}

      {!loadingUsers && users.map((u, i) => {
        const col  = u.avatarColor || colorFor(u.username)
        const init = u.avatarEmoji || (u.username || 'U').slice(0, 2).toUpperCase()
        return (
          <div key={u.uid} className="card anim-fadeUp"
            style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', animationDelay: `${i * 0.04}s` }}
            onClick={() => openChat(u)}
          >
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${col}22`, border: `2px solid ${col}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: u.avatarEmoji ? 24 : 15, fontWeight: 700, color: col, flexShrink: 0 }}>
              {init}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{u.username}</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Tap to chat</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        )
      })}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', direction: 'ltr' }}>

      {/* Chat header */}
      <div style={{ padding: '10px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '6px 8px 6px 0', display: 'flex', alignItems: 'center', minWidth: 36, minHeight: 36 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        {selected && (
          <>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${selected.avatarColor || colorFor(selected.username)}22`, border: `1.5px solid ${selected.avatarColor || colorFor(selected.username)}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: selected.avatarEmoji ? 17 : 12, fontWeight: 600, color: selected.avatarColor || colorFor(selected.username), flexShrink: 0 }}>
              {selected.avatarEmoji || (selected.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{selected.username}</p>
              <p style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} /> Live
              </p>
            </div>
          </>
        )}
      </div>

      {/* Messages area — flex:1 with overflow scroll */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-base)', direction: 'ltr' }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-3)', padding: '60px 0' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity=".2">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <p style={{ fontSize: 14 }}>Say hello to {selected?.username}! 👋</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} msg={msg} isMe={msg.senderId === currentUser?.uid} />
        ))}
        <div ref={bottomRef} style={{ height: 4 }} />
      </div>

      {/* Input bar — always at bottom, never overlaps */}
      <div ref={pickerRef} style={{ flexShrink: 0, background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '10px 12px', position: 'relative', direction: 'ltr' }}>
        {showPicker && (
          <MediaPicker onSelect={handleMedia} onClose={() => setShowPicker(false)} />
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowPicker(p => !p)}
            style={{ background: showPicker ? 'var(--accent-dim)' : 'none', border: 'none', cursor: 'pointer', color: showPicker ? 'var(--accent)' : 'var(--text-3)', padding: '8px', borderRadius: 10, flexShrink: 0, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >GIF</button>

          <input
            ref={inputRef}
            className="tx-input"
            style={{ flex: 1, fontSize: 15, direction: 'ltr', textAlign: 'left' }}
            placeholder="Message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            dir="ltr"
          />

          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="btn-primary"
            style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, padding: 0, minHeight: 44 }}
          >
            {sending
              ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
