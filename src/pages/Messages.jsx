import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/layout/BottomNav'
import ChatWindow from '../components/chat/ChatWindow'

export default function Messages() {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg-base)' }}>
      {/* Header */}
      <div className="mobile-header" style={{ flexShrink:0 }}>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700 }}>Messages</h1>
          <p style={{ fontSize:12, color:'var(--text-2)', marginTop:1 }}>Live chat</p>
        </div>
        <div style={{ width:30, height:30, background:'var(--accent)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 12px var(--accent-glow)', flexShrink:0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
      </div>

      {/* Chat fills remaining space above bottom nav */}
      <div style={{ flex:1, overflow:'hidden', marginBottom:'calc(var(--nav-h) + var(--safe-bottom))' }}>
        <ChatWindow />
      </div>

      <BottomNav />
    </div>
  )
}
