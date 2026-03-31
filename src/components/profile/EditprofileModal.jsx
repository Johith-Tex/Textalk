import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateUserProfile } from '../../firebase/userProfile'
import { uploadAvatar } from '../../firebase/cloudinary'
import { completeTask } from '../../firebase/shop'

const COLORS = ['#1D9E75','#378ADD','#D85A30','#7F77DD','#D4537E','#EF9F27','#E24B4A','#5DCAA5','#F4C0D1']
const EMOJIS = ['😄','🔥','👾','🚀','🎯','🎸','🌙','⚡','🦋','🎨','🏄','🧠']

export default function EditProfileModal({ profile, onClose, onSaved }) {
  const { currentUser } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.username || currentUser?.displayName || '')
  const [bio, setBio]                 = useState(profile?.bio || '')
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor || '#1D9E75')
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatarEmoji || '')
  const [avatarUrl, setAvatarUrl]     = useState(profile?.avatarUrl || null)
  const [saving, setSaving]           = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [uploadPct, setUploadPct]     = useState(0)
  const [error, setError]             = useState('')
  const fileRef = useRef(null)

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5*1024*1024) { setError('Photo must be under 5MB'); return }
    setUploading(true); setUploadPct(0); setError('')
    try {
      const url = await uploadAvatar(file, pct => setUploadPct(pct))
      setAvatarUrl(url)
      setAvatarEmoji('')   
    } catch { setError('Upload failed — check Cloudinary is set up.') }
    finally { setUploading(false); e.target.value='' }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!displayName.trim()) { setError('Display name cannot be empty.'); return }
    setSaving(true); setError('')
    try {
      await updateUserProfile({
        uid: currentUser.uid,
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarColor,
        avatarEmoji,
        avatarUrl,
      })
      await completeTask(currentUser.uid, 'customise_prof')
      if (avatarUrl) await completeTask(currentUser.uid, 'upload_pfp')
      onSaved({ username: displayName.trim(), bio: bio.trim(), avatarColor, avatarEmoji, avatarUrl })
      onClose()
    } catch { setError('Could not save. Please try again.') }
    finally { setSaving(false) }
  }

  const initials = avatarEmoji || (displayName||'U').slice(0,2).toUpperCase()

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div className="anim-fadeUp" style={{ background:'var(--bg-card)', border:'1px solid var(--border-h)', borderRadius:20, padding:'24px 22px', width:'100%', maxWidth:440, maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700 }}>Edit profile</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-2)', padding:4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        {/* Avatar preview */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:`${avatarColor}22`, border:`2.5px solid ${avatarColor}`, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', boxShadow:`0 0 22px ${avatarColor}55` }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontSize: avatarEmoji?32:24, fontWeight:700, color:avatarColor }}>{initials}</span>
              }
            </div>
            {/* Upload button overlay */}
            <button onClick={()=>fileRef.current?.click()} style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'var(--accent)', border:'2px solid var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px solid var(--bg-card)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoSelect} />
          </div>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-2)', marginBottom:5 }}>
              <span>Uploading photo…</span><span>{uploadPct}%</span>
            </div>
            <div style={{ height:3, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${uploadPct}%`, background:'var(--accent)', transition:'width .2s' }} />
            </div>
          </div>
        )}

        {/* Photo note */}
        {!avatarUrl && (
          <p style={{ fontSize:11, color:'var(--text-3)', textAlign:'center', marginBottom:14, lineHeight:1.5 }}>
            Tap the camera icon to upload a photo · JPG/PNG under 5MB<br/>
            <em>Requires Cloudinary to be set up</em>
          </p>
        )}
        {avatarUrl && (
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
            <button onClick={()=>{ setAvatarUrl(null) }} style={{ fontSize:12, color:'#f87171', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', textDecoration:'underline' }}>Remove photo</button>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            <div>
              <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:6 }}>Display name</label>
              <input className="tx-input" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name" maxLength={30} />
            </div>

            <div>
              <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:6 }}>Bio <span style={{ color:'var(--text-3)' }}>(optional)</span></label>
              <textarea className="tx-input" value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell people about yourself…" maxLength={120} rows={3} style={{ resize:'none' }} />
              <div style={{ fontSize:11, color:'var(--text-3)', textAlign:'right', marginTop:3 }}>{bio.length}/120</div>
            </div>

            {/* Avatar colour */}
            <div>
              <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:8 }}>Avatar colour</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={()=>setAvatarColor(c)} style={{ width:30, height:30, borderRadius:'50%', background:c, border:'none', cursor:'pointer', outline:avatarColor===c?`3px solid ${c}`:'3px solid transparent', outlineOffset:2, transition:'outline .15s' }} />
                ))}
              </div>
            </div>

            {/* Emoji (only if no photo) */}
            {!avatarUrl && (
              <div>
                <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:8 }}>Avatar emoji <span style={{ color:'var(--text-3)' }}>(replaces initials)</span></label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <button type="button" onClick={()=>setAvatarEmoji('')} style={{ width:36, height:36, borderRadius:8, border:`1px solid ${avatarEmoji===''?'var(--accent)':'var(--border)'}`, background:avatarEmoji===''?'var(--accent-dim)':'transparent', cursor:'pointer', fontSize:11, color:'var(--text-2)' }}>none</button>
                  {EMOJIS.map(em=>(
                    <button key={em} type="button" onClick={()=>setAvatarEmoji(em)} style={{ width:36, height:36, borderRadius:8, border:`1px solid ${avatarEmoji===em?'var(--accent)':'var(--border)'}`, background:avatarEmoji===em?'var(--accent-dim)':'transparent', cursor:'pointer', fontSize:18 }}>{em}</button>
                  ))}
                </div>
              </div>
            )}

            {error && <div style={{ background:'rgba(226,75,74,0.1)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#f87171' }}>{error}</div>}

            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button type="button" className="btn-ghost" onClick={onClose} style={{ flex:1, minHeight:46 }}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving||uploading} style={{ flex:2, minHeight:46 }}>
                {saving ? <span className="spinner" style={{ margin:'0 auto', width:15, height:15, borderWidth:1.5 }} /> : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
