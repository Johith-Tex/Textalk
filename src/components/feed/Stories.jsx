import { useState, useEffect, useRef } from 'react'
import { subscribeToStories, postStory } from '../../firebase/stories'
import { useAuth } from '../../context/AuthContext'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

function StoryRing({ user, hasStory, isMe, onClick }) {
  const color   = user.avatarColor || '#1D9E75'
  const initials= user.avatarEmoji || (user.username||'U').slice(0,2).toUpperCase()
  const ringStyle = hasStory
    ? { background: `conic-gradient(${color} 0%, ${color} 100%)`, padding: 2, borderRadius: '50%' }
    : { background: 'var(--border)', padding: 2, borderRadius: '50%' }
  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
      <div style={{ ...ringStyle, padding: 2, borderRadius: '50%' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${color}22`, border: '2px solid var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: user.avatarEmoji ? 24 : 16, fontWeight: 700, color }}>
          {isMe ? (hasStory ? initials : <span style={{ fontSize: 22 }}>+</span>) : initials}
        </div>
      </div>
      <p style={{ fontSize: 10, color: 'var(--text-2)', whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
        {isMe ? 'Your story' : user.username}
      </p>
    </div>
  )
}

function StoryViewer({ stories, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const story = stories[idx]
  if (!story) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }} onClick={() => { if (idx < stories.length - 1) setIdx(i => i + 1); else onClose() }}>
      {/* Progress bars */}
      <div style={{ display: 'flex', gap: 3, padding: '48px 12px 8px', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        {stories.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i <= idx ? 'white' : 'rgba(255,255,255,0.3)' }} />
        ))}
      </div>
      {/* Header */}
      <div style={{ position: 'absolute', top: 56, left: 16, right: 40, zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${story.avatarColor||'#1D9E75'}33`, border: `2px solid ${story.avatarColor||'#1D9E75'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: story.avatarEmoji ? 18 : 12, fontWeight: 700, color: story.avatarColor||'#1D9E75', flexShrink: 0 }}>
          {story.avatarEmoji || (story.username||'U').slice(0,2).toUpperCase()}
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{story.username}</p>
      </div>
      <button onClick={e => { e.stopPropagation(); onClose() }} style={{ position: 'absolute', top: 52, right: 16, zIndex: 2, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white', width: 32, height: 32, borderRadius: '50%', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {story.mediaUrl && story.mediaType === 'image' && <img src={story.mediaUrl} alt="story" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12 }} />}
        {story.content && <p style={{ color: 'white', fontSize: 20, fontWeight: 500, textAlign: 'center', lineHeight: 1.5, maxWidth: 300 }}>{story.content}</p>}
      </div>
    </div>
  )
}

export default function Stories() {
  const { currentUser } = useAuth()
  const [stories, setStories]   = useState([])
  const [myProfile, setProfile] = useState(null)
  const [viewer, setViewer]     = useState(null)
  const [showCompose, setCompose] = useState(false)
  const [storyText, setStoryText] = useState('')
  const [posting, setPosting]   = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const u1 = subscribeToStories(setStories)
    const u2 = currentUser ? onSnapshot(doc(db, 'users', currentUser.uid), snap => { if (snap.exists()) setProfile(snap.data()) }) : () => {}
    return () => { u1(); u2() }
  }, [currentUser])

  // Group stories by user, deduplicated
  const byUser = {}
  stories.forEach(s => { if (!byUser[s.userId]) byUser[s.userId] = { user: { uid: s.userId, username: s.username, avatarColor: s.avatarColor, avatarEmoji: s.avatarEmoji }, stories: [] }; byUser[s.userId].stories.push(s) })
  const myHasStory = !!byUser[currentUser?.uid]
  const others = Object.values(byUser).filter(g => g.user.uid !== currentUser?.uid)

  async function submitStory() {
    if (!storyText.trim() || !myProfile) return
    setPosting(true)
    await postStory(currentUser.uid, myProfile.username, myProfile.avatarColor, myProfile.avatarEmoji, storyText.trim(), null, null)
    setStoryText(''); setCompose(false); setPosting(false)
  }

  return (
    <>
      <div style={{ overflowX: 'auto', display: 'flex', gap: 14, padding: '12px 16px', borderBottom: '0.5px solid var(--border)', scrollbarWidth: 'none' }}>
        {/* My story */}
        {myProfile && (
          <StoryRing
            user={myProfile}
            hasStory={myHasStory}
            isMe
            onClick={() => myHasStory ? setViewer({ stories: byUser[currentUser.uid].stories, start: 0 }) : setCompose(true)}
          />
        )}
        {/* Others */}
        {others.map(g => (
          <StoryRing key={g.user.uid} user={g.user} hasStory onClick={() => setViewer({ stories: g.stories, start: 0 })} />
        ))}
        {others.length === 0 && !myHasStory && (
          <p style={{ fontSize: 12, color: 'var(--text-3)', alignSelf: 'center', paddingLeft: 4 }}>No stories yet — tap + to add yours</p>
        )}
      </div>

      {/* Story composer sheet */}
      {showCompose && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }} onClick={e => { if (e.target === e.currentTarget) setCompose(false) }}>
          <div className="anim-slideUp" style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-h)', margin: '0 auto 20px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Add a story</h3>
            <textarea className="tx-input" style={{ resize: 'none', height: 100, fontSize: 15, direction: 'ltr' }} placeholder="What's your story?" value={storyText} onChange={e => setStoryText(e.target.value)} autoFocus />
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, marginBottom: 14 }}>Disappears in 24 hours</p>
            <button className="btn-primary" onClick={submitStory} disabled={posting || !storyText.trim()} style={{ minHeight: 48, fontSize: 15 }}>
              {posting ? <span className="spinner" style={{ margin: '0 auto', width: 16, height: 16, borderWidth: 2 }} /> : 'Post story'}
            </button>
          </div>
        </div>
      )}

      {/* Viewer */}
      {viewer && <StoryViewer stories={viewer.stories} startIndex={viewer.start} onClose={() => setViewer(null)} />}
    </>
  )
}
