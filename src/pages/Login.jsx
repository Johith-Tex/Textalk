import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../firebase/auth'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handle(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await loginUser(email, password); navigate('/') }
    catch (err) { setError(friendly(err.code)) }
    finally { setLoading(false) }
  }

  function friendly(code) {
    if (code === 'auth/user-not-found')    return 'No account found with this email.'
    if (code === 'auth/wrong-password')    return 'Incorrect password.'
    if (code === 'auth/invalid-credential') return 'Incorrect email or password.'
    if (code === 'auth/invalid-email')     return 'Please enter a valid email.'
    if (code === 'auth/too-many-requests') return 'Too many attempts — try again later.'
    return 'Something went wrong. Please try again.'
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-base)', padding:24, position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', width:500, height:500, background:'radial-gradient(circle, rgba(29,158,117,0.1) 0%, transparent 70%)', top:-150, left:-150, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, background:'radial-gradient(circle, rgba(29,158,117,0.06) 0%, transparent 70%)', bottom:-100, right:-100, pointerEvents:'none' }} />

      <div className="anim-fadeUp" style={{ width:'100%', maxWidth:400, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:54, height:54, background:'var(--accent)', borderRadius:15, marginBottom:14, boxShadow:'0 0 32px var(--accent-glow)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:30, fontWeight:700, letterSpacing:'-0.5px' }}>Textalk</h1>
          <p style={{ color:'var(--text-2)', fontSize:13, marginTop:6 }}>Welcome back — sign in to continue</p>
        </div>

        <div className="card" style={{ padding:'28px 28px' }}>
          <form onSubmit={handle}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:6 }}>Email</label>
                <input className="tx-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, color:'var(--text-2)', marginBottom:6 }}>Password</label>
                <input className="tx-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              {error && (
                <div className="anim-fadeIn" style={{ background:'rgba(226,75,74,0.1)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#f87171' }}>
                  {error}
                </div>
              )}
              <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:4 }}>
                {loading ? <span className="spinner" style={{ margin:'0 auto' }} /> : 'Sign in'}
              </button>
            </div>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-2)' }}>
          No account?{' '}
          <Link to="/register" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}
