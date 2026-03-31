import { useState } from 'react'
import { deletePost, toggleLike, votePoll } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { SongCard } from './SongPicker'
import Comments from './Comments'

function timeAgo(ts) {
  if (!ts) return 'just now'
  const sec = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (sec < 60)    return 'just now'
  if (sec < 3600)  return `${Math.floor(sec/60)}m ago`
  if (sec < 86400) return `${Math.floor(sec/3600)}h ago`
  return `${Math.floor(sec/86400)}d ago`
}

function PollDisplay({ poll, postId, currentUid }) {
  const [voting, setVoting] = useState(false)
  const totalVotes = poll.options.reduce((a, o) => a + (o.votes?.length || 0), 0)
  const myVote = poll.options.findIndex(o => (o.votes||[]).includes(currentUid))
  const hasVoted = myVote !== -1

  async function vote(i) {
    if (voting || hasVoted) return
    setVoting(true)
    await votePoll(postId, i, currentUid)
    setVoting(false)
  }

  return (
    <div style={{ padding: '10px 16px', background: 'var(--bg-hover)', margin: '8px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{poll.question}</p>
      {poll.options.map((o, i) => {
        const pct = totalVotes ? Math.round((o.votes?.length||0) / totalVotes * 100) : 0
        const isMyVote = myVote === i
        return (
          <div key={i} onClick={() => vote(i)} style={{ marginBottom: 8, cursor: hasVoted ? 'default' : 'pointer', borderRadius: 8, overflow: 'hidden', border: `1px solid ${isMyVote ? 'var(--accent)' : 'var(--border)'}`, position: 'relative' }}>
            {hasVoted && <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: isMyVote ? 'var(--accent-dim)' : 'var(--bg-input)', transition: 'width .4s ease', borderRadius: 8 }} />}
            <div style={{ position: 'relative', padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: isMyVote ? 'var(--accent)' : 'var(--text-1)', fontWeight: isMyVote ? 500 : 400 }}>{o.text}</span>
              {hasVoted && <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{pct}%</span>}
            </div>
          </div>
        )
      })}
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
    </div>
  )
}

function VideoPlayer({ url }) {
  return (
    <div style={{ background: '#000', borderRadius: 12, overflow: 'hidden' }}>
      <video src={url} controls playsInline loop preload="metadata" style={{ width: '100%', maxHeight: 400, display: 'block' }} />
    </div>
  )
}

function ImageViewer({ url }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <img src={url} alt="post" style={{ width: '100%', borderRadius: 12, display: 'block', cursor: 'pointer', maxHeight: 400, objectFit: 'cover' }} onClick={() => setExpanded(true)} />
      {expanded && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setExpanded(false)}>
          <img src={url} alt="post" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setExpanded(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
      )}
    </>
  )
}

export default function PostCard({ post, index }) {
  const { currentUser } = useAuth()
  const liked    = post.likes?.includes(currentUser?.uid)
  const [likeAnim, setLikeAnim]   = useState(false)
  const [showComments, setComments] = useState(false)

  async function handleLike() {
    if (!currentUser) return
    setLikeAnim(true); setTimeout(() => setLikeAnim(false), 350)
    await toggleLike(post.id, currentUser.uid, liked)
  }

  const initials = (post.username||'U').slice(0,2).toUpperCase()
  const colors   = ['#1D9E75','#378ADD','#D85A30','#7F77DD','#D4537E','#EF9F27']
  const color    = colors[initials.charCodeAt(0) % colors.length]

  return (
    <>
      <div className="card anim-fadeUp" style={{ overflow: 'hidden', animationDelay: `${index*0.05}s` }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}22`, border: `1.5px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{post.username}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>{timeAgo(post.createdAt)}</span>
            {post.mediaType === 'video' && <span style={{ marginLeft: 8, fontSize: 10, background: '#7F77DD22', color: '#7F77DD', padding: '2px 7px', borderRadius: 10 }}>Reel</span>}
            {post.song && <span style={{ marginLeft: 8, fontSize: 10, background: '#1DB95422', color: '#1DB954', padding: '2px 7px', borderRadius: 10 }}>♫</span>}
            {post.poll && <span style={{ marginLeft: 8, fontSize: 10, background: '#7F77DD22', color: '#7F77DD', padding: '2px 7px', borderRadius: 10 }}>Poll</span>}
          </div>
          {post.userId === currentUser?.uid && (
            <button onClick={() => { if (window.confirm('Delete this post?')) deletePost(post.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 6, borderRadius: 8, minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => e.currentTarget.style.color='#f87171'} onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          )}
        </div>

        {/* Caption */}
        {post.content && (
          <div style={{ padding: '10px 16px', paddingBottom: (post.mediaUrl || post.song || post.poll) ? 4 : 10 }}>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-1)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', direction: 'ltr', textAlign: 'left' }}>{post.content}</p>
          </div>
        )}

        {/* Media */}
        {post.mediaUrl && (
          <div style={{ padding: '6px 16px' }}>
            {post.mediaType === 'video' ? <VideoPlayer url={post.mediaUrl} /> : <ImageViewer url={post.mediaUrl} />}
          </div>
        )}

        {/* Poll */}
        {post.poll && <PollDisplay poll={post.poll} postId={post.id} currentUid={currentUser?.uid} />}

        {/* Song */}
        {post.song && (
          <div style={{ padding: '6px 16px' }}>
            <SongCard song={post.song} compact />
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: '10px 16px 12px', display: 'flex', gap: 18, borderTop: '0.5px solid var(--border)', marginTop: 10 }}>
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#E24B4A' : 'var(--text-2)', fontSize: 14, fontFamily: 'var(--font-body)', minHeight: 36, padding: '4px 0', transform: likeAnim ? 'scale(1.35)' : 'scale(1)', transition: 'transform .15s, color .15s' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={liked?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span style={{ fontWeight: liked?600:400 }}>{post.likes?.length||0}</span>
          </button>
          <button onClick={() => setComments(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 14, fontFamily: 'var(--font-body)', minHeight: 36, padding: '4px 0' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Comment</span>
          </button>
        </div>
      </div>

      {showComments && <Comments postId={post.id} onClose={() => setComments(false)} />}
    </>
  )
}
