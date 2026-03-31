import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/auth'
import { useEffect, useState } from 'react'
import { subscribeToIncomingRequests } from '../../firebase/friends'

const navItems = [
  { path:'/',         label:'Feed',     icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z"/></svg> },
  { path:'/messages', label:'Messages', icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg> },
  { path:'/people',   label:'People',   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg> },
  { path:'/profile',  label:'Profile',  icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg> },
]

export default function Sidebar({ onShowTutorial }) {
  const { currentUser } = useAuth()
  const location        = useLocation()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!currentUser) return
    return subscribeToIncomingRequests(currentUser.uid, reqs => setPendingCount(reqs.length))
  }, [currentUser])

  const profile  = null
  const initials = (currentUser?.displayName || currentUser?.email || 'U').slice(0,2).toUpperCase()

  return (
    <aside id="sidebar" style={{ width:220, flexShrink:0, background:'var(--bg-card)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0 }}>
      {/* Logo */}
      <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, background:'var(--accent)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 14px var(--accent-glow)', flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <span style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, letterSpacing:'-0.3px' }}>Textalk</span>
      </div>

      {/* Nav */}
      <nav id="nav-links" style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path
          const badge  = item.path==='/people' && pendingCount > 0
          return (
            <Link key={item.path} to={item.path} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
              textDecoration:'none',
              color:  active ? 'var(--accent)' : 'var(--text-2)',
              background: active ? 'var(--accent-dim)' : 'transparent',
              fontWeight: active ? 500 : 400,
              transition:'all 0.15s',
            }}
            onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-1)' }}}
            onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-2)' }}}
            >
              {item.icon}
              <span style={{ fontSize:13 }}>{item.label}</span>
              {badge && (
                <span style={{ marginLeft:'auto', background:'var(--danger)', color:'white', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>{pendingCount}</span>
              )}
              {item.path==='/messages' && !badge && (
                <span style={{ marginLeft:'auto', background:'var(--accent)', color:'white', fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:10 }}>Live</span>
              )}
            </Link>
          )
        })}

        <button onClick={onShowTutorial} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'transparent', border:'none', cursor:'pointer', color:'var(--text-2)', width:'100%', marginTop:8, transition:'all 0.15s', fontFamily:'var(--font-body)' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-1)' }}
          onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-2)' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
          <span style={{ fontSize:13 }}>How to use</span>
        </button>
      </nav>

      {/* User row */}
      <div style={{ padding:'14px 12px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'var(--bg-hover)' }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--accent-dim)', border:'1px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'var(--accent)', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{currentUser?.displayName || 'User'}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div className="online-dot" style={{ width:6, height:6 }} />
              <span style={{ fontSize:11, color:'var(--text-2)' }}>Online</span>
            </div>
          </div>
          <button onClick={logoutUser} title="Sign out" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:4, borderRadius:6, transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
