import { useState, useRef } from 'react'
import { STICKER_PACKS, TRENDING_GIFS } from './Stickers'

const TABS = ['GIFs', 'Stickers']

export default function MediaPicker({ onSelect, onClose }) {
  const [tab, setTab]         = useState('GIFs')
  const [stickerPack, setPack] = useState(0)
  const [gifSearch, setGifSearch] = useState('')
  const [imgErr, setImgErr]   = useState({})

  function handleGif(gif) {
    onSelect({ type: 'gif', content: gif.url })
    onClose()
  }

  function handleSticker(emoji) {
    onSelect({ type: 'sticker', content: emoji })
    onClose()
  }

  const filteredGifs = gifSearch
    ? TRENDING_GIFS.filter((_, i) => i % 2 === 0)   // simple "filter" demo
    : TRENDING_GIFS

  return (
    <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, width: 320, background: 'var(--bg-card)', border: '1px solid var(--border-h)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)', zIndex: 50 }}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 10px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 14px', fontSize: 13, fontFamily: 'var(--font-body)', color: tab === t ? 'var(--accent)' : 'var(--text-2)', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', marginBottom: -1, fontWeight: tab === t ? 500 : 400 }}>
            {t}
          </button>
        ))}
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '0 10px', fontSize: 18 }}>×</button>
      </div>

      {/* GIFs */}
      {tab === 'GIFs' && (
        <div>
          <div style={{ padding: '8px 10px' }}>
            <input className="tx-input" style={{ fontSize: 12, padding: '7px 12px' }} placeholder="Search GIFs…" value={gifSearch} onChange={e => setGifSearch(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '0 10px 10px', maxHeight: 240, overflowY: 'auto' }}>
            {filteredGifs.map(gif => (
              <div key={gif.id} onClick={() => handleGif(gif)} style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: 'var(--bg-hover)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {!imgErr[gif.id] ? (
                  <img src={gif.preview} alt="gif" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(e => ({...e,[gif.id]:true}))} />
                ) : (
                  <span style={{ fontSize: 22 }}>🎬</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stickers */}
      {tab === 'Stickers' && (
        <div>
          {/* Pack selector */}
          <div style={{ display: 'flex', gap: 4, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            {STICKER_PACKS.map((pack, i) => (
              <button key={pack.name} onClick={() => setPack(i)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid', borderColor: stickerPack === i ? 'var(--accent)' : 'var(--border)', background: stickerPack === i ? 'var(--accent-dim)' : 'transparent', color: stickerPack === i ? 'var(--accent)' : 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {pack.name}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4, padding: '10px', maxHeight: 220, overflowY: 'auto' }}>
            {STICKER_PACKS[stickerPack].stickers.map(emoji => (
              <button key={emoji} onClick={() => handleSticker(emoji)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, borderRadius: 8, padding: '6px 4px', transition: 'background 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
