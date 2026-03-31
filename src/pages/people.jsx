import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import {
  sendFriendRequest, subscribeToSentRequests,
  subscribeToIncomingRequests, acceptFriendRequest,
  declineFriendRequest, removeFriend,
} from '../firebase/friends'
import AppShell from '../components/layout/AppShell'
import ProfileCard from '../components/profile/ProfileCard'

export default function People() {
  const { currentUser } = useAuth()
  const [allUsers, setAllUsers]     = useState([])
  const [myProfile, setMyProfile]   = useState(null)
  const [search, setSearch]         = useState('')
  const [sending, setSending]       = useState({})
  const [sentUids, setSentUids]     = useState([])
  const [incoming, setIncoming]     = useState([])
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!currentUser) return
    return onSnapshot(collection(db, 'users'), snap => {
      const list = snap.docs.map(d => d.data())
      setAllUsers(list.filter(u => u.uid !== currentUser.uid))
      setLoading(false)
    }, err => { console.error(err.code); setLoading(false) })
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    return onSnapshot(doc(db, 'users', currentUser.uid), snap => {
      if (snap.exists()) setMyProfile(snap.data())
    })
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    const u1 = subscribeToSentRequests(currentUser.uid, r => setSentUids(r.map(x => x.toUid)))
    const u2 = subscribeToIncomingRequests(currentUser.uid, setIncoming)
    return () => { u1(); u2() }
  }, [currentUser])

  const statusFor = uid => {
    if (myProfile?.friends?.[uid]) return 'friend'
    if (sentUids.includes(uid))    return 'sent'
    return 'none'
  }

  async function handleSend(user) {
    setSending(s => ({ ...s, [user.uid]: true }))
    await sendFriendRequest(currentUser.uid, myProfile?.username || currentUser.displayName || 'User', user.uid, user.username)
    setSending(s => ({ ...s, [user.uid]: false }))
  }

  async function handleAccept(req) {
    await acceptFriendRequest(req.id, req.fromUid, req.fromUsername, currentUser.uid, myProfile?.username || currentUser.displayName)
  }

  async function handleRemove(uid) {
    if (!window.confirm('Remove this friend?')) return
    await removeFriend(currentUser.uid, uid)
  }

  const accentColors = ['#1D9E75','#378ADD','#D85A30','#7F77DD','#D4537E','#EF9F27']
  const colorFor = name => accentColors[(name||'U').charCodeAt(0) % accentColors.length]

  const displayed = search
    ? allUsers.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()))
    : allUsers

  return (
    <AppShell title="People" subtitle={loading ? 'Loading…' : `${allUsers.length} user${allUsers.length !== 1 ? 's' : ''} on Textalk`}>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Incoming requests */}
        {incoming.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: 'var(--danger)', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>{incoming.length}</span>
              Friend requests
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {incoming.map(req => {
                const col  = colorFor(req.fromUsername)
                const init = (req.fromUsername||'U').slice(0,2).toUpperCase()
                return (
                  <div key={req.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${col}22`, border: `1.5px solid ${col}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: col, flexShrink: 0 }}>
                      {init}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{req.fromUsername}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-2)' }}>sent you a friend request</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 12, minHeight: 36 }} onClick={() => declineFriendRequest(req.id)}>✕</button>
                      <button className="btn-primary" style={{ padding: '7px 14px', fontSize: 12, minHeight: 36 }} onClick={() => handleAccept(req)}>Accept</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input className="tx-input" style={{ paddingLeft: 42 }} placeholder="Search by username…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 20 }}>×</button>}
        </div>

        {/* User list */}
        {loading ? [1,2,3].map(i => (
          <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 180, height: 12 }} />
            </div>
          </div>
        )) : displayed.length === 0 ? (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>{search ? `No users matching "${search}"` : 'No other users yet.'}</p>
          </div>
        ) : displayed.map((user, i) => {
          const status   = statusFor(user.uid)
          const color    = user.avatarColor || colorFor(user.username)
          const initials = user.avatarEmoji || (user.username||'U').slice(0,2).toUpperCase()
          return (
            <div key={user.uid} className="card anim-fadeUp"
              style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.15s', animationDelay: `${i*0.04}s` }}
              onClick={() => setSelected(user)}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: user.avatarEmoji ? 24 : 15, fontWeight: 700, color, flexShrink: 0, boxShadow: `0 0 10px ${color}22` }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{user.username}</p>
                <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.bio || 'No bio yet'}
                </p>
              </div>
              <div onClick={e => e.stopPropagation()}>
                {status === 'friend' ? (
                  <span style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--accent)44', whiteSpace: 'nowrap' }}>Friends</span>
                ) : status === 'sent' ? (
                  <span style={{ fontSize: 12, color: 'var(--text-2)', background: 'var(--bg-hover)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>Sent</span>
                ) : (
                  <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13, minHeight: 38 }} disabled={!!sending[user.uid]} onClick={() => handleSend(user)}>
                    {sending[user.uid] ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> : '+ Add'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <ProfileCard
          user={selected}
          friendStatus={statusFor(selected.uid)}
          onClose={() => setSelected(null)}
          onSendRequest={() => handleSend(selected)}
          onRemoveFriend={() => { handleRemove(selected.uid); setSelected(null) }}
        />
      )}
    </AppShell>
  )
}
