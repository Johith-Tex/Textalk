import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { subscribeToIncomingRequests } from '../../firebase/friends'

const NAV = [
  { path: '/', label: 'Feed', icon: a => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={a?0:1.8}><path d="M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z"/></svg>
  )},
  { path: '/messages', label: 'Chats', icon: a => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={a?0:1.8}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
  )},
  { path: '/people', label: 'People', icon: a => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={a?0:1.8}><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
  )},
  { path: '/shop', label: 'Shop', icon: a => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={a?'#EF9F27':'none'} stroke={a?'#EF9F27':'currentColor'} strokeWidth={a?0:1.8}><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2" stroke={a?'white':'currentColor'} strokeWidth="1.8" strokeLinecap="round"/></svg>
  )},
  { path: '/profile', label: 'Me', icon: a => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={a?'currentColor':'none'} stroke="currentColor" strokeWidth={a?0:1.8}><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
  )},
]

export default function BottomNav() {
  const location = useLocation()
  const { currentUser } = useAuth()
  const [pending, setPending] = useState(0)

  useEffect(() => {
    if (!currentUser) return
    return subscribeToIncomingRequests(currentUser.uid, r => setPending(r.length))
  }, [currentUser])

  return (
    <nav className="bottom-nav">
      {NAV.map(item => {
        const active = location.pathname === item.path
        const isShop = item.path === '/shop'
        const col    = active && isShop ? '#EF9F27' : active ? 'var(--accent)' : 'var(--text-3)'
        return (
          <Link key={item.path} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', padding: '4px 12px', color: col, transition: 'color .15s', position: 'relative', minWidth: 48 }}>
            <div style={{ position: 'relative' }}>
              {item.icon(active)}
              {item.path === '/people' && pending > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -6, width: 16, height: 16, background: 'var(--danger)', borderRadius: '50%', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-base)' }}>
                  {pending > 9 ? '9+' : pending}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: '0.01em' }}>{item.label}</span>
            {active && <span style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: col }} />}
          </Link>
        )
      })}
    </nav>
  )
}
