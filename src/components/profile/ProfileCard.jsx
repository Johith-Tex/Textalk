import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { sendFriendRequest, declineFriendRequest } from '../../firebase/friends'

const THEMES = {
  '#1D9E75': { bg:'#0a1f18', border:'#1D9E75', glow:'rgba(29,158,117,0.3)',  banner:'linear-gradient(135deg,#0a2a1e,#0f3d2a)', tag:'#0d2e22' },
  '#378ADD': { bg:'#0c1929', border:'#378ADD', glow:'rgba(55,138,221,0.3)',  banner:'linear-gradient(135deg,#0c1d33,#0e2a4a)', tag:'#0d2039' },
  '#D85A30': { bg:'#271208', border:'#D85A30', glow:'rgba(216,90,48,0.3)',   banner:'linear-gradient(135deg,#2a1008,#3d1a0a)', tag:'#2a1308' },
  '#7F77DD': { bg:'#16133a', border:'#7F77DD', glow:'rgba(127,119,221,0.3)', banner:'linear-gradient(135deg,#181440,#201860)', tag:'#1a1640' },
  '#D4537E': { bg:'#280d1a', border:'#D4537E', glow:'rgba(212,83,126,0.3)',  banner:'linear-gradient(135deg,#2a0d1c,#3d1228)', tag:'#2a0e1e' },
  '#EF9F27': { bg:'#271a04', border:'#EF9F27', glow:'rgba(239,159,39,0.3)',  banner:'linear-gradient(135deg,#2a1c04,#3d2806)', tag:'#2a1c06' },
  '#E24B4A': { bg:'#270a0a', border:'#E24B4A', glow:'rgba(226,75,74,0.3)',   banner:'linear-gradient(135deg,#2a0c0c,#3d1010)', tag:'#2a0c0c' },
  '#5DCAA5': { bg:'#0a201c', border:'#5DCAA5', glow:'rgba(93,202,165,0.3)',  banner:'linear-gradient(135deg,#0a2a24,#0f3d34)', tag:'#0d2e28' },
  '#F4C0D1': { bg:'#271520', border:'#F4C0D1', glow:'rgba(244,192,209,0.3)', banner:'linear-gradient(135deg,#2a1824,#3d2030)', tag:'#2a1a26' },
}

function defaultTheme(color) {
  return THEMES[color] || THEMES['#1D9E75']
}

function timeAgo(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `Joined ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function ProfileCard({ user, friendStatus, onClose, onSendRequest, onRemoveFriend }) {
  const { currentUser } = useAuth()
  const [postCount, setPostCount] = useState(null)
  const [recentPosts, setRecentPosts] = useState([])
  const [acting, setActing] = useState(false)

  const color   = user.avatarColor || '#1D9E75'
  const theme   = defaultTheme(color)
  const initials= user.avatarEmoji || (user.username || 'U').slice(0, 2).toUpperCase()
  const friends = user.friends || {}
  const friendCount = Object.keys(friends).length

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    getDocs(q).then(snap => {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setPostCount(posts.length)
      setRecentPosts(posts.slice(0, 2))
    }).catch(() => setPostCount(0))
  }, [user.uid])

  async function handleRequest() {
    setActing(true)
    await onSendRequest()
    setActing(false)
  }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="anim-fadeUp" style={{ width:'100%', maxWidth:420, borderRadius:20, overflow:'hidden', border:`1px solid ${theme.border}44`, boxShadow:`0 0 60px ${theme.glow}` }}>

        {/* Banner */}
        <div style={{ height:90, background:theme.banner, position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.4)', border:'none', cursor:'pointer', color:'#fff', width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
          {/* Avatar overlapping banner */}
          <div style={{ position:'absolute', bottom:-28, left:24, width:60, height:60, borderRadius:'50%', background:`${color}22`, border:`3px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:user.avatarEmoji?26:18, fontWeight:700, color, boxShadow:`0 0 24px ${theme.glow}`, zIndex:2 }}>
            {initials}
          </div>
        </div>

        {/* Card body */}
        <div style={{ background:theme.bg, padding:'38px 24px 24px' }}>

          {/* Name + action */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'#fff' }}>{user.username}</h2>
              {user.bio && <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', marginTop:4, lineHeight:1.5, maxWidth:240 }}>{user.bio}</p>}
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>{timeAgo(user.createdAt)}</p>
            </div>

            <div style={{ flexShrink:0 }}>
              {friendStatus === 'friend' ? (
                <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                  <span style={{ fontSize:12, color, background:`${color}22`, padding:'5px 14px', borderRadius:20, border:`1px solid ${color}66` }}>Friends</span>
                  <button onClick={onRemoveFriend} style={{ fontSize:11, color:'rgba(255,255,255,0.3)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Remove</button>
                </div>
              ) : friendStatus === 'sent' ? (
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.07)', padding:'5px 14px', borderRadius:20, border:'1px solid rgba(255,255,255,0.1)' }}>Requested</span>
              ) : (
                <button onClick={handleRequest} disabled={acting} style={{ background:color, color:'#fff', border:'none', borderRadius:10, padding:'7px 16px', fontSize:13, fontWeight:500, cursor:'pointer', opacity: acting?0.7:1, transition:'opacity 0.15s', fontFamily:'var(--font-body)' }}>
                  {acting ? '...' : '+ Add friend'}
                </button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:0, marginBottom:18, background:'rgba(255,255,255,0.04)', borderRadius:12, border:`1px solid ${color}22`, overflow:'hidden' }}>
            {[
              { label:'Posts',   value: postCount === null ? '—' : postCount },
              { label:'Friends', value: friendCount },
              { label:'Likes',   value: recentPosts.reduce((a,p)=>a+(p.likes?.length||0),0) || 0 },
            ].map((stat, i) => (
              <div key={stat.label} style={{ flex:1, padding:'14px 10px', textAlign:'center', borderRight: i<2 ? `1px solid ${color}22` : 'none' }}>
                <div style={{ fontSize:18, fontWeight:700, color, fontFamily:'var(--font-display)' }}>{stat.value}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent posts preview */}
          {recentPosts.length > 0 && (
            <div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:8, fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' }}>Recent posts</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {recentPosts.map(post => (
                  <div key={post.id} style={{ background:theme.tag, border:`1px solid ${color}22`, borderRadius:10, padding:'10px 14px' }}>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                      {post.content}
                    </p>
                    <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:6, display:'flex', alignItems:'center', gap:4 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {post.likes?.length || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentPosts.length === 0 && postCount === 0 && (
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', textAlign:'center', padding:'12px 0' }}>No posts yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
