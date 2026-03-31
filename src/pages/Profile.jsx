import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import EditProfileModal from '../components/profile/EditprofileModal'
import FriendList from '../components/friends/FriendList'
import { THEMES, BADGES } from '../firebase/shop'

const getThemeBanner = color => {
  const t = THEMES.find(t => t.color === color)
  return t ? `linear-gradient(135deg,${t.preview[0]},${t.preview[1]}88)` : 'linear-gradient(135deg,#0a2a1e,#0f3d2a)'
}

function AnimatedFrame({ frameId, color, size, children }) {
  const FRAMES_MAP = {
    spin_green:   { type:'conic', bg:`conic-gradient(transparent 0deg,#1D9E75 90deg,transparent 180deg)`, anim:'spin 2s linear infinite' },
    spin_gold:    { type:'conic', bg:`conic-gradient(transparent 0deg,#EF9F27 90deg,transparent 180deg)`, anim:'spin 2s linear infinite' },
    spin_rainbow: { type:'conic', bg:'conic-gradient(red,orange,yellow,green,blue,violet,red)', anim:'spin 1.5s linear infinite' },
    neon_pulse:   { type:'shadow', sh:`0 0 0 3px ${color},0 0 16px ${color}`, anim:'pulseRing 1.2s ease-out infinite' },
    fire_frame:   { type:'shadow', sh:'0 0 0 3px #ff4500,0 0 24px #ff450099' },
    galaxy:       { type:'conic', bg:'conic-gradient(#7F77DD,#378ADD,#1D9E75,#D4537E,#7F77DD)', anim:'spin 3s linear infinite' },
  }
  const f = FRAMES_MAP[frameId]
  if (!f) return <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0 }}>{children}</div>
  if (f.type === 'conic') return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:f.bg, animation:f.anim, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', padding:3 }}>
      <div style={{ width:size-6, height:size-6, borderRadius:'50%', background:'var(--bg-base)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {children}
      </div>
    </div>
  )
  return <div style={{ width:size, height:size, borderRadius:'50%', boxShadow:f.sh, animation:f.anim||'none', flexShrink:0 }}>{children}</div>
}

export default function Profile() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile]   = useState(null)
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [tab, setTab]           = useState('posts')
  const [likes, setLikes]       = useState(0)

  useEffect(() => {
    if (!currentUser) return
    return onSnapshot(doc(db,'users',currentUser.uid), snap => { if(snap.exists()) setProfile(snap.data()) })
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    const q = query(collection(db,'posts'), where('userId','==',currentUser.uid), orderBy('createdAt','desc'))
    getDocs(q).then(snap => {
      const list = snap.docs.map(d=>({id:d.id,...d.data()}))
      setPosts(list); setLikes(list.reduce((a,p)=>a+(p.likes?.length||0),0)); setLoading(false)
    }).catch(()=>setLoading(false))
  }, [currentUser])

  const color       = profile?.avatarColor   || '#1D9E75'
  const themeId     = profile?.equippedTheme || 'default'
  const frameId     = profile?.equippedFrame || 'none'
  const accent      = THEMES.find(t=>t.id===themeId)?.color || '#1D9E75'
  const equBadge    = BADGES.find(b => b.id === (profile?.equippedBadge||''))
  const avatarUrl   = profile?.avatarUrl     || null
  const emoji       = profile?.avatarEmoji   || ''
  const name        = profile?.username      || currentUser?.displayName || 'User'
  const bio         = profile?.bio           || ''
  const friends     = profile?.friends       || {}
  const fCount      = Object.keys(friends).length
  const initials    = emoji || name.slice(0,2).toUpperCase()

  const settingsBtn = (
    <button onClick={()=>navigate('/settings')} style={{ background:'var(--bg-hover)', border:'1px solid var(--border)', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-2)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.3-.06.62-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
    </button>
  )

  return (
    <AppShell title={name} headerRight={settingsBtn}>
      <div style={{ height:100, background:getThemeBanner(accent) }} />

      <div style={{ padding:'0 16px 16px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)', marginTop:-1 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:-36 }}>
          <AnimatedFrame frameId={frameId} color={accent} size={78}>
            <div style={{ width:78, height:78, borderRadius:'50%', background:`${accent}22`, border:`3px solid ${accent}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:avatarUrl?0:emoji?30:22, fontWeight:700, color:accent, overflow:'hidden' }}>
              {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
            </div>
          </AnimatedFrame>
          <button onClick={()=>setShowEdit(true)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:10, padding:'7px 16px', color:'var(--text-1)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:500 }}>
            Edit profile
          </button>
        </div>

        <div style={{ marginTop:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700 }}>{name}</h2>
            {equBadge && <span style={{ fontSize:11, background:'#EF9F2722', color:'#EF9F27', padding:'2px 9px', borderRadius:10, border:'1px solid #EF9F2740' }}>{equBadge.icon} {equBadge.label}</span>}
            {profile?.isPrivate && <span style={{ fontSize:11, background:'#7F77DD22', color:'#7F77DD', padding:'2px 8px', borderRadius:10 }}>Private</span>}
          </div>
          {profile?.mood && <p style={{ fontSize:13, color:'var(--text-2)', marginTop:4 }}>{profile.mood.emoji} {profile.mood.text}</p>}
          {bio && <p style={{ fontSize:14, color:'var(--text-1)', marginTop:8, lineHeight:1.6 }}>{bio}</p>}
        </div>

        <div style={{ display:'flex', gap:0, marginTop:14, background:'var(--bg-hover)', borderRadius:12, overflow:'hidden', border:'1px solid var(--border)' }}>
          {[{l:'Posts',v:posts.length},{l:'Friends',v:fCount},{l:'Likes',v:likes},{l:'Coins',v:profile?.coins||0}].map((s,i,a)=>(
            <div key={s.l} style={{ flex:1, padding:'12px 6px', textAlign:'center', borderRight:i<a.length-1?'1px solid var(--border)':'none' }}>
              <div style={{ fontSize:17, fontWeight:700, color:s.l==='Coins'?'#EF9F27':accent, fontFamily:'var(--font-display)' }}>{s.v}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--bg-card)', position:'sticky', top:56, zIndex:40 }}>
        {[{id:'posts',label:'Posts'},{id:'friends',label:'Friends'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:'13px 8px', fontSize:14, fontFamily:'var(--font-body)', color:tab===t.id?accent:'var(--text-2)', borderBottom:tab===t.id?`2px solid ${accent}`:'2px solid transparent', fontWeight:tab===t.id?600:400 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 16px 40px', display:'flex', flexDirection:'column', gap:10 }}>
        {tab==='posts'&&(loading?<div style={{textAlign:'center',padding:40}}><span className="spinner"/></div>:posts.length===0?(
          <div className="card" style={{padding:'40px 24px',textAlign:'center'}}><p style={{fontSize:14,color:'var(--text-2)'}}>No posts yet — share something!</p></div>
        ):posts.map((p,i)=>(
          <div key={p.id} className="card anim-fadeUp" style={{ padding:'14px 16px', animationDelay:`${i*.05}s`, borderLeft:`3px solid ${accent}44` }}>
            <p style={{ fontSize:14, lineHeight:1.65, whiteSpace:'pre-wrap', wordBreak:'break-word', direction:'ltr', textAlign:'left' }}>{p.content}</p>
            <p style={{ fontSize:12, color:'var(--text-2)', marginTop:8 }}>♥ {p.likes?.length||0}</p>
          </div>
        )))}
        {tab==='friends'&&<FriendList friends={friends}/>}
      </div>

      {showEdit&&<EditProfileModal profile={profile} onClose={()=>setShowEdit(false)} onSaved={u=>setProfile(p=>({...p,...u}))}/>}
    </AppShell>
  )
}
