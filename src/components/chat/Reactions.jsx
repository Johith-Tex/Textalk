import { useState } from 'react'
import { ref, update } from 'firebase/database'
import { rtdb } from '../../firebase/config'

const QUICK = ['❤️','😂','😮','😢','🔥','👍']

export default function Reactions({ chatId, msgId, reactions, myUid, onClose }) {
  const [saving, setSaving] = useState(false)

  async function react(emoji) {
    setSaving(true)
    const path = `chats/${chatId}/messages/${msgId}/reactions/${myUid}`
    const current = reactions?.[myUid]
    await update(ref(rtdb), { [path]: current === emoji ? null : emoji })
    setSaving(false)
    onClose()
  }

  return (
    <div className="anim-fadeIn" style={{ display: 'flex', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 40, padding: '8px 12px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
      {QUICK.map(emoji => (
        <button key={emoji} onClick={() => react(emoji)} disabled={saving} style={{ fontSize: 24, background: reactions?.[myUid] === emoji ? 'var(--accent-dim)' : 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .1s' }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export function ReactionDisplay({ reactions }) {
  if (!reactions) return null
  const counts = {}
  Object.values(reactions).forEach(e => { if (e) counts[e] = (counts[e]||0)+1 })
  const entries = Object.entries(counts)
  if (!entries.length) return null
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
      {entries.map(([emoji, count]) => (
        <span key={emoji} style={{ fontSize: 11, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 14 }}>{emoji}</span>
          {count > 1 && <span style={{ color: 'var(--text-2)' }}>{count}</span>}
        </span>
      ))}
    </div>
  )
}
