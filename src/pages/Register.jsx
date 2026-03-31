import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../firebase/auth'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handle(e) {
    e.preventDefault(); setError(''); setLoading(true)
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
    if (username.trim().length < 2) { setError('Username must be at least 2 characters.'); setLoading(false); return }
    try { await registerUser(email, password, username.trim()); navigate('/') }
    catch (err) { setError(friendly(err.code)) }
    finally { setLoading(false) }
  }

  function friendly(code) {
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists.'
    if (code === 'auth/invalid-email')        return 'Please enter a valid email address.'
    if (code === 'auth/weak-password')        return 'Password must be at least 6 characters.'
    return 'Could not create account. Please try again.'
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', padding:24, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:500, height:500, background:'radial-gradient(circle, rgba(29,158,117,0.1) 0%, transparent 70%)', top:-100, right:-100, pointerEvents:'none' }} />

      <div className="anim-fadeUp" style={{ width:'100%', maxWidth:400, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:54, height:54, background:'var(--accent)', borderRadius:15, marginBottom:14, boxShadow:'0 0 32px var(--accent-glow)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:30, fontWeight:700, letterSpacing:'-0.5px' }}>Join Textalk</h1>
          <p style={{ color:'var(--text-2)', fontSize:13, marginTop:6 }}>Free forever. No ads. No tracking.</p>
        </div>

        <div className="card" style={{ padding:'28px 28px' }}>
          <form onSubmit={handle}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:6 }}>Username</label>
                <input className="tx-input" type="text" placeholder="e.g. ravi_k" value={username} onChange={e=>setUsername(e.target.value)} required />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:6 }}>Email</label>
                <input className="tx-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:6 }}>Password</label>
                <input className="tx-input" type="password" placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="new-password" />
              </div>
              {error && (
                <div className="anim-fadeIn" style={{ background:'rgba(226,75,74,0.1)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#f87171' }}>
                  {error}
                </div>
              )}
              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:4 }}>
                {loading ? <span className="spinner" style={{ margin:'0 auto' }} /> : 'Create account'}
              </button>
            </div>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
