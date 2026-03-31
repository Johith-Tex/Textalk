import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { removeFriend } from '../../firebase/friends'
import { useAuth } from '../../context/AuthContext'

export default function FriendList({ friends }) {
  const { currentUser } = useAuth()
  const navigate        = useNavigate()
  const [removing, setRemoving] = useState(null)

  const entries = Object.entries(friends || {})

  if (entries.length === 0) return (
    <div className="card" style={{ padding:'28px 20px', textAlign:'center' }}>
      <p style={{ fontSize:13, color:'var(--text-2)' }}>No friends yet — find people in the People tab.</p>
    </div>
  )

  async function remove(friendUid) {
    if (!window.confirm('Remove this friend?')) return
    setRemoving(friendUid)
    await removeFriend(currentUser.uid, friendUid)
    setRemoving(null)
  }

  const colors = ['#1D9E75','#378ADD','#D85A30','#7F77DD','#D4537E','#EF9F27']
  function colorFor(name) { return colors[(name||'U').charCodeAt(0)%colors.length] }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {entries.map(([uid, username], i) => {
        const color    = colorFor(username)
        const initials = (username||'U').slice(0,2).toUpperCase()
        return (
          <div key={uid} className="card anim-fadeUp" style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12, animationDelay:`${i*0.05}s` }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:`${color}22`, border:`1.5px solid ${color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color, flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:500 }}>{username}</p>
              <p style={{ fontSize:11, color:'var(--text-2)', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }} />
                Friend
              </p>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn-ghost" style={{ padding:'5px 12px', fontSize:12 }}
                onClick={()=>navigate('/messages')}>
                Message
              </button>
              <button onClick={()=>remove(uid)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:'5px 8px', borderRadius:8, transition:'color 0.15s' }} disabled={removing===uid}
                onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}
              >
                {removing===uid ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                )}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
