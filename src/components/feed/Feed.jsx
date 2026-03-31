import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createPost, subscribeToFeed } from '../../firebase/firestore'
import { uploadMedia } from '../../firebase/cloudinary'
import MediaComposer from './MediaComposer'
import SongPicker, { SongCard } from './SongPicker'
import PollCreator from './PollCreator'
import PostCard from './PostCard'
import Stories from './Stories'

function SkeletonPost() {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: 120, height: 13, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 60, height: 11 }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: '100%', height: 13, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '70%', height: 13 }} />
    </div>
  )
}

export default function Feed() {
  const { currentUser } = useAuth()
  const [posts, setPosts]       = useState([])
  const [content, setContent]   = useState('')
  const [media, setMedia]       = useState(null)
  const [song, setSong]         = useState(null)
  const [poll, setPoll]         = useState(null)
  const [mode, setMode]         = useState(null)  // null | 'song' | 'poll'
  const [loading, setLoading]   = useState(true)
  const [posting, setPosting]   = useState(false)
  const [error, setError]       = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    return subscribeToFeed(data => { setPosts(data); setLoading(false) })
  }, [])

  async function handlePost(e) {
    e.preventDefault()
    if (!content.trim() && !media && !song && !poll) return
    if (media && !media.url) { setError('Please wait for upload to finish.'); return }
    setPosting(true); setError('')
    try {
      await createPost(currentUser.uid, currentUser.displayName || 'User', content.trim(), media, song, poll)
      setContent(''); setMedia(null); setSong(null); setPoll(null); setMode(null)
      textareaRef.current?.focus()
    } catch (err) {
      setError('Failed to post. Please try again.')
    } finally { setPosting(false) }
  }

  function autoResize(e) {
    setContent(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const canPost = (content.trim() || media?.url || song || poll) && !posting

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Stories row */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Stories />
      </div>

      {/* Composer */}
      <div id="post-composer" className="card" style={{ padding: '14px 16px' }}>
        <form onSubmit={handlePost}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)', border: '1.5px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>
              {(currentUser?.displayName || 'U').slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <textarea ref={textareaRef} className="tx-input" style={{ resize: 'none', minHeight: 48, overflow: 'hidden', background: 'transparent', border: 'none', boxShadow: 'none', padding: '8px 0', fontSize: 15, direction: 'ltr', textAlign: 'left' }}
                placeholder="What's on your mind?" value={content} onChange={autoResize}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost(e) }} dir="ltr" />
              <MediaComposer onMediaReady={m => { setMedia(m); setMode(null) }} onMediaClear={() => setMedia(null)} />
              {mode === 'song' && <SongPicker onSongReady={s => { setSong(s); setMode(null) }} onClear={() => { setSong(null); setMode(null) }} />}
              {mode === 'poll' && <PollCreator onPollReady={p => { setPoll(p); setMode(null) }} onClear={() => { setPoll(null); setMode(null) }} />}
              {song && <div style={{ marginTop: 8 }}><SongCard song={song} compact /></div>}
              {poll && (
                <div style={{ marginTop: 8, background: 'var(--bg-hover)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{poll.question}</p>
                  {poll.options.map((o,i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>• {o.text}</p>)}
                </div>
              )}
            </div>
          </div>

          {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{error}</p>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '0.5px solid var(--border)', flexWrap: 'wrap' }}>
            {/* Song button */}
            {!song && (
              <button type="button" onClick={() => setMode(mode === 'song' ? null : 'song')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: mode==='song'?'var(--accent-dim)':'none', border: `1px solid ${mode==='song'?'var(--accent)':'var(--border)'}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: mode==='song'?'var(--accent)':'var(--text-2)', fontSize: 12, fontFamily: 'var(--font-body)', minHeight: 34 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                Song
              </button>
            )}
            {/* Poll button */}
            {!poll && (
              <button type="button" onClick={() => setMode(mode === 'poll' ? null : 'poll')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: mode==='poll'?'#7F77DD22':'none', border: `1px solid ${mode==='poll'?'#7F77DD':'var(--border)'}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: mode==='poll'?'#7F77DD':'var(--text-2)', fontSize: 12, fontFamily: 'var(--font-body)', minHeight: 34 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>
                Poll
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button className="btn-primary" type="submit" disabled={!canPost} style={{ width: 'auto', padding: '8px 22px', fontSize: 14, minHeight: 42 }}>
              {posting ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 1.5 }} /> : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {loading ? [1,2,3].map(i=><SkeletonPost key={i} />) : posts.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📸</div>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>No posts yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Be the first to share something!</p>
        </div>
      ) : posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
    </div>
  )
}
