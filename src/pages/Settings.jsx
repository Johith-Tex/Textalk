import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { updateAccountSettings, setMood, changePassword } from '../firebase/settings'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { logoutUser } from '../firebase/auth'

const MOOD_EMOJIS = ['😄','🔥','🎧','📚','🏋️','🎮','😴','🤔','😎','✈️','🍕','🎨','💪','🌙','⚡','🎯']

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:8, paddingLeft:4 }}>{title}</p>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, sublabel, children, last, danger }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:last?'none':'0.5px solid var(--border)', gap:12, minHeight:56 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14, color:danger?'#f87171':'var(--text-1)' }}>{label}</p>
        {sublabel && <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2, lineHeight:1.4 }}>{sublabel}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width:46, height:26, borderRadius:13, background:value?'var(--accent)':'var(--border-h)', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0, minWidth:46 }}>
      <div style={{ position:'absolute', top:3, left:value?23:3, width:20, height:20, borderRadius:'50%', background:'white', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }} />
    </div>
  )
}

export default function Settings() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile]   = useState(null)
  const [loaded, setLoaded]     = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState('')
  const [showMood, setShowMood] = useState(false)
  const [moodText, setMoodText] = useState('')
  const [moodEmoji, setMoodEmoji] = useState('😄')
  const [pwForm, setPwForm]     = useState({ current:'', next:'', confirm:'' })
  const [pwError, setPwError]   = useState('')
  const [pwOk, setPwOk]         = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const unsub = onSnapshot(
      doc(db, 'users', currentUser.uid),
      snap => {
        const d = snap.exists() ? snap.data() : {}
        setProfile(d)
        setLoaded(true)
        if (d.mood) { setMoodText(d.mood.text||''); setMoodEmoji(d.mood.emoji||'😄') }
      },
      err => { console.error('settings:', err.code); setProfile({}); setLoaded(true) }
    )
    return unsub
  }, [currentUser])

  async function save(field, value) {
    if (!currentUser) return
    setSaving(true)
    await updateAccountSettings({ uid: currentUser.uid, [field]: value })
    setSaved(field); setTimeout(() => setSaved(''), 2000)
    setSaving(false)
  }

  async function saveMood() {
    if (!currentUser) return
    setSaving(true)
    await setMood(currentUser.uid, moodText.trim() ? { emoji: moodEmoji, text: moodText.trim() } : null)
    setSaved('mood'); setTimeout(() => setSaved(''), 2000)
    setSaving(false); setShowMood(false)
  }

  async function handlePw(e) {
    e.preventDefault()
    setPwError('')
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match"); return }
    if (pwForm.next.length < 6) { setPwError("Min. 6 characters"); return }
    try {
      await changePassword(pwForm.current, pwForm.next)
      setPwOk(true); setPwForm({ current:'', next:'', confirm:'' })
      setTimeout(() => setPwOk(false), 3000)
    } catch (err) {
      setPwError(err.code === 'auth/wrong-password' ? 'Current password incorrect.' : 'Failed — try again.')
    }
  }

  if (!loaded) return (
    <AppShell title="Settings">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
        <div style={{ textAlign:'center' }}>
          <span className="spinner" style={{ width:28, height:28, borderWidth:2.5 }} />
          <p style={{ fontSize:13, color:'var(--text-2)', marginTop:14 }}>Loading settings…</p>
        </div>
      </div>
    </AppShell>
  )

  const mood = profile?.mood

  return (
    <AppShell title="Settings">
      <div style={{ padding:'16px 16px 48px' }}>

        {/* Mood */}
        <Section title="Status">
          <Row label="Mood" sublabel={mood ? `${mood.emoji}  ${mood.text}` : 'Not set — let friends know what you\'re up to'} last>
            <button onClick={() => setShowMood(p=>!p)} className="btn-ghost" style={{ padding:'6px 14px', fontSize:13, minHeight:36, flexShrink:0 }}>
              {mood ? 'Change' : 'Set'}
            </button>
          </Row>
          {showMood && (
            <div style={{ padding:'14px 16px', borderTop:'0.5px solid var(--border)', background:'var(--bg-hover)' }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:12 }}>
                {MOOD_EMOJIS.map(em => (
                  <button key={em} onClick={()=>setMoodEmoji(em)} style={{ width:38, height:38, borderRadius:10, border:`1.5px solid ${moodEmoji===em?'var(--accent)':'var(--border)'}`, background:moodEmoji===em?'var(--accent-dim)':'transparent', cursor:'pointer', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center' }}>{em}</button>
                ))}
              </div>
              <input className="tx-input" style={{ marginBottom:10, fontSize:14 }} placeholder="What are you up to? (max 40 chars)" value={moodText} onChange={e=>setMoodText(e.target.value)} maxLength={40} />
              {mood && <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <p style={{ fontSize:13, color:'var(--text-2)' }}>Current: {mood.emoji} {mood.text}</p>
                <button onClick={()=>{ setMood(currentUser.uid, null); setShowMood(false); setMoodText('') }} style={{ fontSize:12, color:'#f87171', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', textDecoration:'underline' }}>Clear</button>
              </div>}
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>setShowMood(false)} className="btn-ghost" style={{ flex:1, minHeight:42, fontSize:13 }}>Cancel</button>
                <button onClick={saveMood} disabled={saving} className="btn-primary" style={{ flex:2, minHeight:42, fontSize:13 }}>
                  {saving ? <span className="spinner" style={{ width:14, height:14, borderWidth:1.5, margin:'0 auto' }} /> : `Save mood`}
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <Row label="Private account" sublabel="Only friends can send you direct messages">
            <Toggle value={!!profile?.isPrivate} onChange={v => save('isPrivate', v)} />
          </Row>
          <Row label="Account visibility" sublabel={profile?.isPrivate ? 'Private — friends only can DM you' : 'Public — anyone can message you'} last>
            <span style={{ fontSize:12, color:profile?.isPrivate?'#7F77DD':'var(--accent)', background:profile?.isPrivate?'#7F77DD22':'var(--accent-dim)', padding:'5px 12px', borderRadius:20, border:`1px solid ${profile?.isPrivate?'#7F77DD44':'var(--accent)44'}`, flexShrink:0 }}>
              {profile?.isPrivate ? 'Private' : 'Public'}
            </span>
          </Row>
        </Section>

        {/* Account */}
        <Section title="Account">
          <Row label="Username" sublabel={profile?.username || currentUser?.displayName} last />
          <Row label="Email" sublabel={currentUser?.email} last />
        </Section>

        {/* Coins summary — tap goes to shop */}
        <Section title="Shop">
          <Row label="Your coins" sublabel={`${profile?.coins||0} coins · ${(profile?.completedTasks||[]).length}/${20} tasks done`} last>
            <button onClick={() => navigate('/shop')} className="btn-primary" style={{ width:'auto', padding:'7px 16px', fontSize:13, minHeight:36, flexShrink:0 }}>
              Open shop
            </button>
          </Row>
        </Section>

        {/* Password */}
        <Section title="Security">
          <div style={{ padding:'14px 16px' }}>
            <form onSubmit={handlePw} style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <input className="tx-input" type="password" placeholder="Current password" value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} autoComplete="current-password" />
              <input className="tx-input" type="password" placeholder="New password (min 6)" value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} autoComplete="new-password" />
              <input className="tx-input" type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} autoComplete="new-password" />
              {pwError && <p style={{ fontSize:12, color:'#f87171' }}>{pwError}</p>}
              {pwOk    && <p style={{ fontSize:12, color:'var(--accent)' }}>✓ Password updated successfully</p>}
              <button className="btn-primary" type="submit" style={{ minHeight:46, fontSize:14 }}>Update password</button>
            </form>
          </div>
        </Section>

        {/* Sign out */}
        <Section title="Account actions">
          <Row label="Sign out of Textalk" last danger>
            <button onClick={logoutUser} style={{ background:'#f8717118', border:'1px solid #f8717130', borderRadius:10, padding:'7px 16px', color:'#f87171', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)', minHeight:36, flexShrink:0 }}>
              Sign out
            </button>
          </Row>
        </Section>

      </div>
    </AppShell>
  )
}
