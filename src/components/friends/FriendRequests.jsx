import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { subscribeToIncomingRequests, acceptFriendRequest, declineFriendRequest } from '../../firebase/friends'

export default function FriendRequests() {
  const { currentUser } = useAuth()
  const [requests, setRequests] = useState([])
  const [acting, setActing]     = useState({})

  useEffect(() => {
    if (!currentUser) return
    return subscribeToIncomingRequests(currentUser.uid, setRequests)
  }, [currentUser])

  async function accept(req) {
    setActing(a=>({...a,[req.id]:'accept'}))
    await acceptFriendRequest(req.id, req.fromUid, req.fromUsername, req.toUid, req.toUsername)
    setActing(a=>({...a,[req.id]:null}))
  }

  async function decline(req) {
    setActing(a=>({...a,[req.id]:'decline'}))
    await declineFriendRequest(req.id)
    setActing(a=>({...a,[req.id]:null}))
  }

  if (requests.length === 0) return null

  return (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:12, fontWeight:500, color:'var(--text-2)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ background:'var(--accent)', color:'white', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>{requests.length}</span>
        Friend requests
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {requests.map(req => {
          const initials = (req.fromUsername||'U').slice(0,2).toUpperCase()
          const colors   = ['#1D9E75','#378ADD','#D85A30','#7F77DD','#D4537E']
          const color    = colors[initials.charCodeAt(0)%colors.length]
          return (
            <div key={req.id} className="card anim-fadeIn" style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:`${color}22`, border:`1.5px solid ${color}55`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color, flexShrink:0 }}>
                {initials}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:500 }}>{req.fromUsername}</p>
                <p style={{ fontSize:11, color:'var(--text-2)' }}>wants to be your friend</p>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={()=>decline(req)} className="btn-ghost" style={{ padding:'5px 12px', fontSize:12 }} disabled={!!acting[req.id]}>
                  {acting[req.id]==='decline' ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} /> : 'Decline'}
                </button>
                <button onClick={()=>accept(req)} className="btn-primary" style={{ padding:'5px 14px', fontSize:12, width:'auto' }} disabled={!!acting[req.id]}>
                  {acting[req.id]==='accept' ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} /> : 'Accept'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
