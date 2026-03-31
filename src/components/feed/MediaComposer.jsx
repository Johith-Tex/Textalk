import { useState, useRef } from 'react'
import { uploadMedia } from '../../firebase/cloudinary'

const MAX_IMAGE = 10 * 1024 * 1024  
const MAX_VIDEO = 100 * 1024 * 1024 
export default function MediaComposer({ onMediaReady, onMediaClear }) {
  const [preview, setPreview]     = useState(null)   
  const [progress, setProgress]   = useState(null)   
  const [error, setError]         = useState('')
  const [uploaded, setUploaded]   = useState(null)   
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) { setError('Only images and videos are supported.'); return }
    if (isImage && file.size > MAX_IMAGE) { setError('Images must be under 10 MB.'); return }
    if (isVideo && file.size > MAX_VIDEO) { setError('Videos must be under 100 MB.'); return }

    // Local preview
    const localUrl = URL.createObjectURL(file)
    setPreview({ url: localUrl, type: isVideo ? 'video' : 'image' })
    setProgress(0)

    try {
      const result = await uploadMedia(file, pct => setProgress(pct))
      setProgress(null)
      setUploaded(result)
      onMediaReady({
        url:  result.url,
        type: result.resourceType,
        meta: { width: result.width, height: result.height, duration: result.duration },
      })
    } catch (err) {
      setProgress(null)
      setPreview(null)
      setError(err.message || 'Upload failed. Check your Cloudinary config.')
      onMediaClear()
    }
    e.target.value = ''
  }

  function clear() {
    if (preview?.url?.startsWith('blob:')) URL.revokeObjectURL(preview.url)
    setPreview(null)
    setUploaded(null)
    setProgress(null)
    setError('')
    onMediaClear()
  }

  return (
    <div>
      {!preview && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {/* Image button */}
          <button type="button" onClick={() => { fileRef.current.accept='image/*'; fileRef.current.click() }}
            style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'5px 12px', cursor:'pointer', color:'var(--text-2)', fontSize:12, fontFamily:'var(--font-body)', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-2)'}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            Photo
          </button>
          {/* Video button */}
          <button type="button" onClick={() => { fileRef.current.accept='video/*'; fileRef.current.click() }}
            style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'5px 12px', cursor:'pointer', color:'var(--text-2)', fontSize:12, fontFamily:'var(--font-body)', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#7F77DD';e.currentTarget.style.color='#7F77DD'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-2)'}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
            Video / Reel
          </button>
          <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleFile} />
        </div>
      )}

      {/* Upload progress */}
      {progress !== null && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-2)', marginBottom:4 }}>
            <span>Uploading…</span><span>{progress}%</span>
          </div>
          <div style={{ height:3, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:'var(--accent)', borderRadius:2, transition:'width 0.2s' }} />
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && progress === null && (
        <div style={{ marginTop: 10, position:'relative', display:'inline-block', maxWidth:'100%' }}>
          {preview.type === 'image' ? (
            <img src={preview.url} alt="preview" style={{ maxWidth:'100%', maxHeight:300, borderRadius:10, border:'1px solid var(--border)', display:'block' }} />
          ) : (
            <video src={preview.url} controls style={{ maxWidth:'100%', maxHeight:300, borderRadius:10, border:'1px solid var(--border)', display:'block' }} />
          )}
          <button onClick={clear} style={{ position:'absolute', top:6, right:6, width:24, height:24, borderRadius:'50%', background:'rgba(0,0,0,0.7)', border:'none', cursor:'pointer', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>×</button>
          {uploaded && <div style={{ marginTop:4, fontSize:11, color:'var(--accent)', display:'flex', alignItems:'center', gap:4 }}><span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }}/>Ready to post</div>}
        </div>
      )}

      {error && <p style={{ fontSize:12, color:'#f87171', marginTop:8 }}>{error}</p>}
    </div>
  )
}
