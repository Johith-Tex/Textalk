import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { THEMES } from '../../firebase/shop'
import BottomNav from './BottomNav'
import Tutorial from './Tutorial'
import { useAnimatedBackground } from './AppBackground'

export default function AppShell({ children, title, subtitle, headerRight }) {
  const { currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    return onSnapshot(doc(db, 'users', currentUser.uid), snap => {
      if (snap.exists()) setProfile(snap.data())
    })
  }, [currentUser])

  useEffect(() => {
    if (!localStorage.getItem('textalk_toured')) {
      setTimeout(() => setShowTutorial(true), 800)
    }
  }, [])

  const equippedBg    = profile?.equippedBg    || 'none'
  const equippedTheme = profile?.equippedTheme || 'default'
  const themeColor    = THEMES.find(t => t.id === equippedTheme)?.color || '#1D9E75'
  const canvasRef     = useAnimatedBackground(equippedBg, themeColor)

  return (
    <>
      {/* Animated background canvas */}
      {equippedBg !== 'none' && (
        <canvas ref={canvasRef} style={{ position:'fixed', inset:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none', opacity:.65 }} />
      )}

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
        {/* Sticky mobile header */}
        <div className="mobile-header" style={{ flexShrink:0 }}>
          <div style={{ flex:1 }}>
            {title && <h1 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, lineHeight:1.2 }}>{title}</h1>}
            {subtitle && <p style={{ fontSize:12, color:'var(--text-2)', marginTop:1 }}>{subtitle}</p>}
          </div>
          {headerRight && <div style={{ flexShrink:0 }}>{headerRight}</div>}
          <div style={{ width:30, height:30, background:'var(--accent)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 12px var(--accent-glow)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          </div>
        </div>

        {/* Page content */}
        <div className="page">{children}</div>

        <BottomNav />
      </div>

      {showTutorial && (
        <Tutorial onClose={() => { localStorage.setItem('textalk_toured','1'); setShowTutorial(false) }} />
      )}
    </>
  )
}
