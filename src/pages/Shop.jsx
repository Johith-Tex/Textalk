import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { TASKS, THEMES, EFFECTS, BADGES, purchaseItem, equipItem } from '../firebase/shop'
import AppShell from '../components/layout/AppShell'

function CoinPill({ coins }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, background:'#EF9F2718', border:'1px solid #EF9F2740', borderRadius:20, padding:'4px 12px' }}>
      <span style={{ fontSize:14 }}>🪙</span>
      <span style={{ fontSize:14, fontWeight:700, color:'#EF9F27', fontFamily:'var(--font-display)' }}>{coins ?? 0}</span>
    </div>
  )
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0
  return (
    <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden', marginTop:6 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color||'var(--accent)', borderRadius:2, transition:'width .4s ease' }} />
    </div>
  )
}

function ThemeCard({ theme, owned, equipped, coins, onBuy, onEquip, buying, equipping }) {
  const locked  = theme.desc?.startsWith('🔒')
  const canAfford = coins >= theme.price
  return (
    <div style={{ border: equipped ? `2px solid ${theme.color}` : '1px solid var(--border)', borderRadius:16, overflow:'hidden', background:'var(--bg-card)', transition:'border-color .15s', opacity: (!owned && !canAfford) ? 0.75 : 1 }}>
      {/* Preview swatch */}
      <div style={{ height:72, background:`linear-gradient(135deg, ${theme.preview[0]}, ${theme.preview[1]}88)`, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:`${theme.color}33`, border:`2.5px solid ${theme.color}`, display:'flex', alignItems:'center', justifyContent:'center', color:theme.color, fontWeight:700, fontSize:15 }}>Tx</div>
        {equipped && <div style={{ position:'absolute', top:7, right:7, background:theme.color, borderRadius:10, padding:'2px 8px', fontSize:9, color:'#fff', fontWeight:700 }}>ACTIVE</div>}
        {locked && !owned && <div style={{ position:'absolute', top:7, left:7, background:'rgba(0,0,0,0.5)', borderRadius:10, padding:'2px 8px', fontSize:9, color:'#fff' }}>🔒</div>}
      </div>
      <div style={{ padding:'10px 12px 14px' }}>
        <p style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{theme.label}</p>
        <p style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.4, marginBottom:10 }}>{theme.desc?.replace('🔒 ','')}</p>
        {equipped ? (
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:theme.color }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Active
          </div>
        ) : owned ? (
          <button onClick={onEquip} disabled={equipping} className="btn-primary" style={{ width:'100%', padding:'8px 0', fontSize:12, minHeight:36 }}>
            {equipping ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5, margin:'0 auto' }} /> : 'Equip'}
          </button>
        ) : (
          <button onClick={onBuy} disabled={buying || !canAfford} className="btn-primary" style={{ width:'100%', padding:'8px 0', fontSize:12, minHeight:36, background: canAfford ? theme.color : 'var(--bg-hover)', color: canAfford ? '#fff' : 'var(--text-3)', border: canAfford ? 'none' : '1px solid var(--border)' }}>
            {buying ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5, margin:'0 auto' }} /> : (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                <span>🪙</span> {theme.price}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function EffectRow({ effect, owned, equipped, coins, onBuy, onEquip, buying, equipping, currentColor }) {
  const canAfford = coins >= effect.price
  const cssEffects = {
    glow:     { boxShadow:`0 0 14px ${currentColor}` },
    pulse:    { boxShadow:`0 0 0 3px ${currentColor}`, animation:'pulseRing 1.5s ease-out infinite' },
    sparkle:  { boxShadow:`0 0 0 2px ${currentColor}, 0 0 12px ${currentColor}88` },
    rainbow:  { boxShadow:'0 0 0 3px #ff6b6b, 0 0 10px #ffcc00' },
    fire:     { boxShadow:'0 0 0 3px #ff4500, 0 0 18px #ff450088' },
    ice:      { boxShadow:'0 0 0 3px #85B7EB, 0 0 14px #85B7EB88' },
    gold_ring:{ boxShadow:'0 0 0 3px #EF9F27, 0 0 12px #EF9F2788' },
    halo:     { boxShadow:'0 0 0 4px #fff, 0 0 20px rgba(255,255,255,0.5)' },
    vortex:   { boxShadow:`0 0 0 3px ${currentColor}, 0 0 20px ${currentColor}`, animation:'spin 3s linear infinite' },
  }
  const style = cssEffects[effect.id] || {}
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'var(--bg-card)', border: equipped?'2px solid var(--accent)':'1px solid var(--border)', borderRadius:16, opacity:(!owned&&!canAfford)?0.7:1, transition:'all .15s' }}>
      {/* Avatar preview with effect */}
      <div style={{ width:46, height:46, borderRadius:'50%', background:`${currentColor}22`, border:`2px solid ${currentColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, ...style }}>
        {effect.icon}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <p style={{ fontSize:14, fontWeight:500 }}>{effect.label}</p>
          {equipped && <span style={{ fontSize:10, background:'var(--accent-dim)', color:'var(--accent)', padding:'1px 7px', borderRadius:10, fontWeight:600 }}>ACTIVE</span>}
        </div>
        <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{effect.desc?.replace('🔒 ','')}</p>
      </div>
      <div style={{ flexShrink:0 }}>
        {equipped ? (
          <span style={{ fontSize:12, color:'var(--accent)' }}>✓</span>
        ) : owned ? (
          <button onClick={onEquip} disabled={equipping} className="btn-primary" style={{ width:'auto', padding:'7px 16px', fontSize:12, minHeight:36 }}>
            {equipping ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} /> : 'Equip'}
          </button>
        ) : (
          <button onClick={onBuy} disabled={buying || !canAfford} style={{ display:'flex', alignItems:'center', gap:5, background: canAfford?'var(--accent)':'var(--bg-hover)', border: canAfford?'none':'1px solid var(--border)', borderRadius:10, padding:'7px 14px', cursor:canAfford?'pointer':'not-allowed', color:canAfford?'#fff':'var(--text-3)', fontSize:12, fontFamily:'var(--font-body)', fontWeight:500, minHeight:36 }}>
            {buying ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} /> : <><span>🪙</span>{effect.price}</>}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Shop() {
  const { currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [tab, setTab]         = useState('tasks')
  const [buying, setBuying]   = useState(null)
  const [equipping, setEq]    = useState(null)
  const [toast, setToast]     = useState('')

  useEffect(() => {
    if (!currentUser) return
    return onSnapshot(doc(db, 'users', currentUser.uid), snap => {
      if (snap.exists()) setProfile(snap.data())
      else setProfile({})
    }, err => { console.error('shop snapshot:', err); setProfile({}) })
  }, [currentUser])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2800) }

  async function buy(type, item) {
    if (!profile || buying) return
    if ((profile.coins || 0) < item.price) { showToast('❌ Not enough coins'); return }
    setBuying(item.id)
    try {
      await purchaseItem(currentUser.uid, type, item.id, item.price)
      showToast(`✓ ${item.label} purchased!`)
    } catch (e) { showToast('Purchase failed — try again') }
    setBuying(null)
  }

  async function equip(type, itemId) {
    if (!currentUser || equipping) return
    setEq(itemId)
    await equipItem(currentUser.uid, type, itemId)
    setEq(null)
    showToast('✓ Equipped!')
  }

  if (!profile) return (
    <AppShell title="Shop" subtitle="Earn · Buy · Flex">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
        <div style={{ textAlign:'center' }}>
          <span className="spinner" style={{ width:28, height:28, borderWidth:2.5 }} />
          <p style={{ fontSize:13, color:'var(--text-2)', marginTop:14 }}>Loading your shop…</p>
        </div>
      </div>
    </AppShell>
  )

  const completed      = profile.completedTasks  || []
  const ownedThemes    = profile.purchasedThemes  || ['default']
  const ownedEffects   = profile.purchasedEffects || ['none']
  const ownedBadges    = profile.purchasedBadges  || ['early_bird']
  const equippedTheme  = profile.equippedTheme    || 'default'
  const equippedEffect = profile.equippedEffect   || 'none'
  const equippedBadge  = profile.equippedBadge    || ''
  const coins          = profile.coins            || 0
  const activeColor    = THEMES.find(t => t.id === equippedTheme)?.color || '#1D9E75'

  const doneTasks  = TASKS.filter(t => completed.includes(t.id)).length
  const totalCoinsEarnable = TASKS.reduce((a, t) => a + t.coins, 0)

  const TABS = [
    { id:'tasks',   label:'Tasks',   badge: `${doneTasks}/${TASKS.length}` },
    { id:'themes',  label:'Themes',  badge: `${ownedThemes.length}/${THEMES.length}` },
    { id:'effects', label:'Effects', badge: `${ownedEffects.length}/${EFFECTS.length}` },
    { id:'badges',  label:'Badges',  badge: `${ownedBadges.length}/${BADGES.length}` },
  ]

  return (
    <AppShell title="Shop" subtitle="Earn coins · Unlock everything" headerRight={<CoinPill coins={coins} />}>

      {/* Toast */}
      {toast && (
        <div className="anim-slideUp" style={{ position:'fixed', bottom:'calc(var(--nav-h) + var(--safe-bottom) + 16px)', left:16, right:16, zIndex:500, background:'var(--bg-card)', border:'1px solid var(--accent)', borderRadius:14, padding:'12px 18px', textAlign:'center', fontSize:14, color:'var(--text-1)', boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Coin balance hero */}
      <div style={{ margin:'14px 16px 0', background:`linear-gradient(135deg, ${activeColor}18, ${activeColor}08)`, border:`1px solid ${activeColor}33`, borderRadius:18, padding:'18px 20px', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:`${activeColor}22`, border:`2px solid ${activeColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
          🪙
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:26, fontWeight:700, fontFamily:'var(--font-display)', color:'#EF9F27', lineHeight:1 }}>{coins}</p>
          <p style={{ fontSize:12, color:'var(--text-2)', marginTop:4 }}>coins available</p>
          <ProgressBar value={doneTasks} max={TASKS.length} color={activeColor} />
          <p style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>{doneTasks} of {TASKS.length} tasks done · up to {totalCoinsEarnable} coins total</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', background:'var(--bg-card)', position:'sticky', top:56, zIndex:40, marginTop:14 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:'11px 4px', fontSize:12, fontFamily:'var(--font-body)', color:tab===t.id?activeColor:'var(--text-2)', borderBottom:tab===t.id?`2px solid ${activeColor}`:'2px solid transparent', fontWeight:tab===t.id?600:400, transition:'color .15s', display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            {t.label}
            <span style={{ fontSize:10, color:tab===t.id?activeColor:'var(--text-3)' }}>{t.badge}</span>
          </button>
        ))}
      </div>

      <div style={{ padding:'14px 16px 40px' }}>

        {/* TASKS */}
        {tab === 'tasks' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {/* Summary */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:6 }}>
              {[
                { label:'Completed', value:doneTasks, color:'var(--accent)' },
                { label:'Remaining', value:TASKS.length-doneTasks, color:'var(--text-2)' },
                { label:'Earnable', value:TASKS.filter(t=>!completed.includes(t.id)).reduce((a,t)=>a+t.coins,0)+'🪙', color:'#EF9F27' },
              ].map(s => (
                <div key={s.label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
                  <p style={{ fontSize:16, fontWeight:700, color:s.color, fontFamily:'var(--font-display)' }}>{s.value}</p>
                  <p style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {TASKS.map((task, i) => {
              const done = completed.includes(task.id)
              return (
                <div key={task.id} className="anim-fadeUp" style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:'var(--bg-card)', border:`1px solid ${done?'var(--accent)33':'var(--border)'}`, borderRadius:16, animationDelay:`${i*0.03}s`, opacity:done?0.65:1 }}>
                  <span style={{ fontSize:26, flexShrink:0 }}>{task.icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:500, textDecoration:done?'line-through':'none', color:done?'var(--text-2)':'var(--text-1)' }}>{task.label}</p>
                    <p style={{ fontSize:12, marginTop:2, display:'flex', alignItems:'center', gap:4, color:'#EF9F27' }}>+{task.coins} <span style={{ color:'var(--text-3)' }}>coins</span></p>
                  </div>
                  <span style={{ fontSize:done?20:13, color:done?'var(--accent)':'var(--text-3)', background:done?'var(--accent-dim)':'var(--bg-hover)', padding:'4px 10px', borderRadius:20, border:`1px solid ${done?'var(--accent)33':'var(--border)'}`, whiteSpace:'nowrap', flexShrink:0 }}>
                    {done ? '✅' : 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* THEMES */}
        {tab === 'themes' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {THEMES.map(theme => (
              <ThemeCard key={theme.id} theme={theme}
                owned={ownedThemes.includes(theme.id)||theme.price===0}
                equipped={equippedTheme===theme.id}
                coins={coins}
                onBuy={()=>buy('theme',theme)}
                onEquip={()=>equip('theme',theme.id)}
                buying={buying===theme.id}
                equipping={equipping===theme.id}
              />
            ))}
          </div>
        )}

        {/* EFFECTS */}
        {tab === 'effects' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:12, color:'var(--text-2)', marginBottom:4 }}>Effects show around your avatar on your profile and in People.</p>
            {EFFECTS.map(effect => (
              <EffectRow key={effect.id} effect={effect}
                owned={ownedEffects.includes(effect.id)||effect.price===0}
                equipped={equippedEffect===effect.id}
                coins={coins}
                currentColor={activeColor}
                onBuy={()=>buy('effect',effect)}
                onEquip={()=>equip('effect',effect.id)}
                buying={buying===effect.id}
                equipping={equipping===effect.id}
              />
            ))}
          </div>
        )}

        {/* BADGES */}
        {tab === 'badges' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:12, color:'var(--text-2)', marginBottom:4 }}>Badges display on your profile card for others to see.</p>
            {BADGES.map((badge, i) => {
              const owned    = ownedBadges.includes(badge.id) || badge.auto
              const equipped = equippedBadge === badge.id
              const canAfford = coins >= badge.price
              const locked   = badge.desc?.startsWith('🔒')
              return (
                <div key={badge.id} className="anim-fadeUp" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'var(--bg-card)', border:`1px solid ${equipped?'#EF9F2780':'var(--border)'}`, borderRadius:16, animationDelay:`${i*0.04}s`, opacity:(!owned&&!canAfford)?0.7:1 }}>
                  <div style={{ width:50, height:50, borderRadius:14, background:'#EF9F2718', border:'1.5px solid #EF9F2740', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
                    {badge.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <p style={{ fontSize:14, fontWeight:500 }}>{badge.label}</p>
                      {equipped && <span style={{ fontSize:10, background:'#EF9F2722', color:'#EF9F27', padding:'1px 7px', borderRadius:10, fontWeight:600 }}>WEARING</span>}
                    </div>
                    <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{badge.desc?.replace('🔒 ','')}</p>
                    {badge.price > 0 && <p style={{ fontSize:12, color:'#EF9F27', marginTop:3 }}>🪙 {badge.price} coins</p>}
                  </div>
                  <div style={{ flexShrink:0 }}>
                    {equipped ? (
                      <span style={{ fontSize:12, color:'#EF9F27' }}>★</span>
                    ) : owned ? (
                      <button onClick={() => equip('badge', badge.id)} disabled={equipping===badge.id} className="btn-primary" style={{ width:'auto', padding:'7px 14px', fontSize:12, minHeight:36 }}>
                        {equipping===badge.id ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} /> : 'Wear'}
                      </button>
                    ) : (
                      <button onClick={() => buy('badge', badge)} disabled={!!buying||!canAfford} style={{ display:'flex', alignItems:'center', gap:5, background:canAfford?'#EF9F27':'var(--bg-hover)', border:canAfford?'none':'1px solid var(--border)', borderRadius:10, padding:'7px 14px', cursor:canAfford?'pointer':'not-allowed', color:canAfford?'#fff':'var(--text-3)', fontSize:12, fontFamily:'var(--font-body)', fontWeight:500, minHeight:36 }}>
                        {buying===badge.id ? <span className="spinner" style={{ width:12, height:12, borderWidth:1.5 }} /> : <><span>🪙</span>{badge.price}</>}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
