import { useEffect, useRef } from 'react'

function Stars({ canvas }) {
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    const stars = Array.from({length:120}, ()=>({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*1.5+.3, s:Math.random()*.4+.1 }))
    let raf
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      stars.forEach(s => {
        s.y -= s.s; if(s.y < 0) { s.y = canvas.height; s.x = Math.random()*canvas.width }
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle = `rgba(255,255,255,${Math.random()*.4+.3})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  }, [canvas])
}

function Particles({ canvas, color='#1D9E75' }) {
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    const pts = Array.from({length:60}, ()=>({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4, r:Math.random()*3+1 }))
    let raf
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0||p.x>canvas.width) p.vx*=-1
        if(p.y<0||p.y>canvas.height) p.vy*=-1
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle = color+'55'; ctx.fill()
      })
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) {
        const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y)
        if(d<80){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle=color+'22'; ctx.lineWidth=.5; ctx.stroke() }
      }
      raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  }, [canvas, color])
}

function Matrix({ canvas }) {
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    const cols = Math.floor(canvas.width/14)
    const drops = Array(cols).fill(0)
    const chars = 'テアイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789'
    let raf
    function draw() {
      ctx.fillStyle='rgba(13,17,23,0.06)'; ctx.fillRect(0,0,canvas.width,canvas.height)
      ctx.fillStyle='#1D9E75'; ctx.font='12px monospace'
      drops.forEach((y,i)=>{ ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*14,y*14); if(y*14>canvas.height&&Math.random()>.975) drops[i]=0; drops[i]++ })
      raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  }, [canvas])
}

function Aurora({ canvas }) {
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    let t = 0, raf
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      for(let i=0;i<3;i++){
        const y = canvas.height*.3 + Math.sin(t*.5+i*2)*60
        const grad = ctx.createLinearGradient(0,y-80,0,y+80)
        const colors = [['#1D9E75','#378ADD'],['#7F77DD','#D4537E'],['#5DCAA5','#EF9F27']]
        grad.addColorStop(0,'transparent'); grad.addColorStop(.5,colors[i][0]+'40'); grad.addColorStop(1,'transparent')
        ctx.fillStyle=grad
        ctx.beginPath(); ctx.moveTo(0,y)
        for(let x=0;x<canvas.width;x+=5) ctx.lineTo(x, y+Math.sin(x*.01+t*.3+i)*30)
        ctx.lineTo(canvas.width,y+80); ctx.lineTo(0,y+80); ctx.closePath(); ctx.fill()
      }
      t+=.02; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  }, [canvas])
}

function Bubbles({ canvas }) {
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    const bubs = Array.from({length:25},()=>({ x:Math.random()*canvas.width, y:canvas.height+Math.random()*200, r:Math.random()*18+6, s:Math.random()*.5+.3, op:Math.random()*.3+.1 }))
    let raf
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      bubs.forEach(b => {
        b.y-=b.s; b.x+=Math.sin(b.y*.02)*.5
        if(b.y+b.r<0){ b.y=canvas.height+b.r; b.x=Math.random()*canvas.width }
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2)
        ctx.strokeStyle=`rgba(29,158,117,${b.op})`; ctx.lineWidth=1.5; ctx.stroke()
        ctx.fillStyle=`rgba(29,158,117,${b.op*.3})`; ctx.fill()
      })
      raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  }, [canvas])
}

function Nebula({ canvas }) {
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    let t=0, raf
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      const cx=canvas.width/2, cy=canvas.height/2
      for(let i=0;i<6;i++){
        const x=cx+Math.cos(t*.2+i)*180, y=cy+Math.sin(t*.15+i)*120
        const g=ctx.createRadialGradient(x,y,0,x,y,120)
        const cols=['#7F77DD','#D4537E','#378ADD','#1D9E75','#D85A30','#534AB7']
        g.addColorStop(0,cols[i]+'40'); g.addColorStop(1,'transparent')
        ctx.fillStyle=g; ctx.fillRect(0,0,canvas.width,canvas.height)
      }
      for(let i=0;i<3;i++){
        const x=Math.random()*canvas.width, y=Math.random()*canvas.height
        ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fillRect(x,y,1,1)
      }
      t+=.01; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  }, [canvas])
}

function Glitch({ canvas }) {
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    let t=0, raf
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.strokeStyle='rgba(29,158,117,0.08)'; ctx.lineWidth=.5
      for(let x=0;x<canvas.width;x+=30){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke() }
      for(let y=0;y<canvas.height;y+=30){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke() }
      if(Math.random()<.1){
        const y=Math.random()*canvas.height
        ctx.fillStyle=`rgba(29,158,117,${Math.random()*.15})`
        ctx.fillRect(0,y,canvas.width,Math.random()*4+1)
      }
      const sy=((t*2)%canvas.height)
      ctx.fillStyle='rgba(29,158,117,0.04)'; ctx.fillRect(0,sy,canvas.width,2)
      t++; raf=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(raf)
  }, [canvas])
}

const RENDERERS = { stars:Stars, particles:Particles, aurora:Aurora, matrix:Matrix, bubbles:Bubbles, nebula:Nebula, glitch:Glitch }

export default function AppBackground({ bgId, themeColor }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!bgId || bgId === 'none') return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const Renderer = RENDERERS[bgId]
    if (!Renderer) return
    const cleanup = { cancel: null }
    const ctx = canvas.getContext('2d')
    const inst = Renderer({ canvas, color: themeColor })
    return () => {}
  }, [bgId, themeColor])

  if (!bgId || bgId === 'none') return null

  return (
    <canvas ref={canvasRef} style={{ position:'fixed', inset:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none', opacity:.7 }} />
  )
}

export function useAnimatedBackground(bgId, themeColor) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!bgId || bgId === 'none' || !canvasRef.current) return
    const canvas = canvasRef.current
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const ctx = canvas.getContext('2d')
    let raf, t = 0

    const drawFns = {
      stars: () => {
        const stars = Array.from({length:120},()=>({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*1.5+.3, s:Math.random()*.4+.1 }))
        return () => {
          ctx.clearRect(0,0,canvas.width,canvas.height)
          stars.forEach(s => { s.y-=s.s; if(s.y<0){s.y=canvas.height;s.x=Math.random()*canvas.width} ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${Math.random()*.4+.3})`;ctx.fill() })
        }
      },
      particles: () => {
        const c = themeColor||'#1D9E75'
        const pts = Array.from({length:55},()=>({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5, r:Math.random()*2.5+.8 }))
        return () => {
          ctx.clearRect(0,0,canvas.width,canvas.height)
          pts.forEach(p=>{ p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=c+'66';ctx.fill() })
          for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);if(d<100){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=c+'28';ctx.lineWidth=.6;ctx.stroke()}}
        }
      },
      aurora: () => {
        return () => {
          ctx.clearRect(0,0,canvas.width,canvas.height); t+=.015
          for(let i=0;i<3;i++){const y=canvas.height*.28+Math.sin(t+i*2.1)*70;const g=ctx.createLinearGradient(0,y-90,0,y+90);const cl=[['#1D9E75','#378ADD'],['#7F77DD','#D4537E'],['#5DCAA5','#EF9F27']];g.addColorStop(0,'transparent');g.addColorStop(.5,cl[i][0]+'50');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<canvas.width;x+=4)ctx.lineTo(x,y+Math.sin(x*.008+t*.4+i)*35);ctx.lineTo(canvas.width,y+100);ctx.lineTo(0,y+100);ctx.closePath();ctx.fill()}
        }
      },
      matrix: () => {
        const cols=Math.floor(canvas.width/14); const drops=Array(cols).fill(1); const chars='テアイウエカキクコサシスセタチツテトナニヌネ01010110'
        return () => {
          ctx.fillStyle='rgba(13,17,23,0.07)';ctx.fillRect(0,0,canvas.width,canvas.height)
          ctx.fillStyle='#1D9E75';ctx.font='12px monospace'
          drops.forEach((y,i)=>{ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*14,y*14);if(y*14>canvas.height&&Math.random()>.975)drops[i]=0;drops[i]++})
        }
      },
      bubbles: () => {
        const bubs=Array.from({length:22},()=>({x:Math.random()*canvas.width,y:canvas.height+Math.random()*300,r:Math.random()*16+5,s:Math.random()*.6+.2,op:Math.random()*.25+.08}))
        return () => {
          ctx.clearRect(0,0,canvas.width,canvas.height)
          bubs.forEach(b=>{b.y-=b.s;b.x+=Math.sin(b.y*.02)*.6;if(b.y+b.r<0){b.y=canvas.height+b.r;b.x=Math.random()*canvas.width}ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.strokeStyle=`rgba(29,158,117,${b.op})`;ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=`rgba(29,158,117,${b.op*.25})`;ctx.fill()})
        }
      },
      nebula: () => {
        return () => {
          ctx.clearRect(0,0,canvas.width,canvas.height); t+=.008
          const cx=canvas.width/2,cy=canvas.height/2
          const cols=['#7F77DD','#D4537E','#378ADD','#1D9E75','#D85A30','#534AB7']
          for(let i=0;i<6;i++){const x=cx+Math.cos(t*.2+i*1.05)*200,y=cy+Math.sin(t*.15+i*1.05)*140;const g=ctx.createRadialGradient(x,y,0,x,y,130);g.addColorStop(0,cols[i]+'50');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height)}
          for(let i=0;i<2;i++){const x=Math.random()*canvas.width,y=Math.random()*canvas.height;ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(x,y,1,1)}
        }
      },
      glitch: () => {
        return () => {
          ctx.clearRect(0,0,canvas.width,canvas.height); t++
          ctx.strokeStyle='rgba(29,158,117,0.07)';ctx.lineWidth=.5
          for(let x=0;x<canvas.width;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke()}
          for(let y=0;y<canvas.height;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()}
          if(Math.random()<.08){ctx.fillStyle=`rgba(29,158,117,${Math.random()*.12})`;ctx.fillRect(0,Math.random()*canvas.height,canvas.width,Math.random()*3+1)}
          ctx.fillStyle='rgba(29,158,117,0.03)';ctx.fillRect(0,(t*2)%canvas.height,canvas.width,2)
        }
      },
    }

    const drawFn = drawFns[bgId]?.()
    if (!drawFn) return () => window.removeEventListener('resize', resize)

    function loop() { drawFn(); raf = requestAnimationFrame(loop) }
    loop()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [bgId, themeColor])

  return canvasRef
}
