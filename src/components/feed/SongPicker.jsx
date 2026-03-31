import { useState } from 'react'

function parseLink(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('spotify.com')) {
      const match = u.pathname.match(/\/(track|album|playlist)\/([a-zA-Z0-9]+)/)
      if (match) return { platform: 'spotify', type: match[1], id: match[2] }
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.searchParams.get('v') || u.pathname.replace('/', '')
      if (id) return { platform: 'youtube', id }
    }
    if (u.hostname.includes('music.apple.com')) {
      return { platform: 'apple', url }
    }
    return null
  } catch { return null }
}

function SongCard({ song, compact }) {
  const { platform, id, title, artist, url } = song
  const icons = {
    spotify: { color: '#1DB954', label: 'Spotify' },
    youtube: { color: '#FF0000', label: 'YouTube Music' },
    apple:   { color: '#FC3C44', label: 'Apple Music' },
    custom:  { color: '#1D9E75', label: 'Music' },
  }
  const meta = icons[platform] || icons.custom

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-hover)', border: `1px solid ${meta.color}33`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 12, padding: compact ? '10px 14px' : '14px 16px',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      >
        {/* Music note icon */}
        <div style={{ width: compact ? 36 : 44, height: compact ? 36 : 44, borderRadius: 10, background: `${meta.color}22`, border: `1.5px solid ${meta.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width={compact ? 18 : 22} height={compact ? 18 : 22} viewBox="0 0 24 24" fill={meta.color}>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title || 'Shared a song'}
          </p>
          {artist && <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: meta.color }} />
            <span style={{ fontSize: 11, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
      </div>
    </a>
  )
}

export { SongCard }

export default function SongPicker({ onSongReady, onClear }) {
  const [url, setUrl]       = useState('')
  const [title, setTitle]   = useState('')
  const [artist, setArtist] = useState('')
  const [attached, setAttached] = useState(null)
  const [error, setError]   = useState('')

  function attach() {
    if (!url.trim()) { setError('Paste a song link first.'); return }
    if (!title.trim()) { setError('Add a song title.'); return }
    const parsed = parseLink(url.trim())
    const song = {
      url: url.trim(),
      title: title.trim(),
      artist: artist.trim(),
      platform: parsed?.platform || 'custom',
    }
    setAttached(song)
    onSongReady(song)
    setError('')
  }

  function clear() {
    setUrl(''); setTitle(''); setArtist(''); setAttached(null); setError(''); onClear()
  }

  if (attached) return (
    <div style={{ marginTop: 10 }}>
      <SongCard song={attached} compact />
      <button onClick={clear} style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-body)', textDecoration: 'underline' }}>
        Remove song
      </button>
    </div>
  )

  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        className="tx-input"
        style={{ fontSize: 13, minHeight: 42 }}
        placeholder="Paste Spotify, YouTube, or Apple Music link…"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="tx-input"
          style={{ flex: 2, fontSize: 13, minHeight: 42 }}
          placeholder="Song title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          className="tx-input"
          style={{ flex: 1, fontSize: 13, minHeight: 42 }}
          placeholder="Artist"
          value={artist}
          onChange={e => setArtist(e.target.value)}
        />
      </div>
      {error && <p style={{ fontSize: 12, color: '#f87171' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={clear} className="btn-ghost" style={{ flex: 1, padding: '9px 0', fontSize: 13, minHeight: 42 }}>Cancel</button>
        <button onClick={attach} className="btn-primary" style={{ flex: 2, padding: '9px 0', fontSize: 13, minHeight: 42 }}>Attach song</button>
      </div>
    </div>
  )
}
