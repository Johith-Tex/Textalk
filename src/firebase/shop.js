import { doc, updateDoc, arrayUnion, increment, getDoc } from 'firebase/firestore'
import { db } from './config'

export const TASKS = [
  { id: 'welcome',        label: 'Welcome to Textalk!',            coins: 50,  icon: '🎉', auto: true },
  { id: 'first_post',     label: 'Post for the first time',        coins: 20,  icon: '📝' },
  { id: 'post_5',         label: 'Post 5 times',                   coins: 40,  icon: '✍️' },
  { id: 'add_friend',     label: 'Add your first friend',          coins: 20,  icon: '🤝' },
  { id: 'add_3_friends',  label: 'Add 3 friends',                  coins: 40,  icon: '👥' },
  { id: 'send_msg',       label: 'Send your first DM',             coins: 15,  icon: '💬' },
  { id: 'send_10_msgs',   label: 'Send 10 messages',               coins: 35,  icon: '🔥' },
  { id: 'react_msg',      label: 'React to a message',             coins: 10,  icon: '❤️' },
  { id: 'react_5',        label: 'React to 5 messages',            coins: 25,  icon: '💝' },
  { id: 'customise_prof', label: 'Customise your profile',         coins: 15,  icon: '🎨' },
  { id: 'share_song',     label: 'Share a song in the feed',       coins: 20,  icon: '🎵' },
  { id: 'post_story',     label: 'Post your first story',          coins: 25,  icon: '⚡' },
  { id: 'vote_poll',      label: 'Vote in a poll',                 coins: 10,  icon: '📊' },
  { id: 'create_poll',    label: 'Create a poll',                  coins: 20,  icon: '🗳️' },
  { id: 'comment_post',   label: 'Comment on a post',              coins: 10,  icon: '💭' },
  { id: 'get_10_likes',   label: 'Get 10 likes on your posts',     coins: 60,  icon: '⭐' },
  { id: 'set_mood',       label: 'Set your first mood',            coins: 10,  icon: '😄' },
  { id: 'upload_pfp',     label: 'Upload a profile photo',         coins: 20,  icon: '📸' },
  { id: 'buy_item',       label: 'Buy something from the shop',    coins: 30,  icon: '🛍️' },
  { id: 'send_gif',       label: 'Send a GIF in chat',             coins: 10,  icon: '🎬' },
]

export const THEMES = [
  { id: 'default',   label: 'Default',    price: 0,   color: '#1D9E75', preview: ['#0a1f18','#0f3d2a'],  desc: 'The classic Textalk look' },
  { id: 'ocean',     label: 'Ocean',      price: 80,  color: '#378ADD', preview: ['#0c1929','#0e2a4a'],  desc: 'Deep blue waters' },
  { id: 'sunset',    label: 'Sunset',     price: 80,  color: '#D85A30', preview: ['#2a1008','#3d1a0a'],  desc: 'Warm orange tones' },
  { id: 'cosmic',    label: 'Cosmic',     price: 100, color: '#7F77DD', preview: ['#16133a','#201860'],  desc: 'Deep space purple' },
  { id: 'rose',      label: 'Rose',       price: 80,  color: '#D4537E', preview: ['#280d1a','#3d1228'],  desc: 'Soft pink hues' },
  { id: 'gold',      label: 'Gold',       price: 150, color: '#EF9F27', preview: ['#271a04','#3d2806'],  desc: 'Luxurious amber' },
  { id: 'crimson',   label: 'Crimson',    price: 100, color: '#E24B4A', preview: ['#270a0a','#3d1010'],  desc: 'Bold red energy' },
  { id: 'mint',      label: 'Mint',       price: 80,  color: '#5DCAA5', preview: ['#0a201c','#0f3d34'],  desc: 'Fresh mint green' },
  { id: 'sakura',    label: 'Sakura',     price: 180, color: '#F4C0D1', preview: ['#271520','#3d2030'],  desc: 'Cherry blossom pink' },
  { id: 'midnight',  label: 'Midnight',   price: 220, color: '#534AB7', preview: ['#0e0c1f','#1a1640'],  desc: 'Dark indigo night' },
  { id: 'forest',    label: 'Forest',     price: 120, color: '#3B6D11', preview: ['#0f1f06','#1a3a09'],  desc: 'Deep woodland green' },
  { id: 'arctic',    label: 'Arctic',     price: 160, color: '#85B7EB', preview: ['#0d1f2d','#1a3a54'],  desc: 'Icy polar blue' },
  { id: 'neon',      label: 'Neon',       price: 250, color: '#5DCAA5', preview: ['#050f0c','#081a14'],  desc: '🔒 Premium cyber glow' },
  { id: 'obsidian',  label: 'Obsidian',   price: 300, color: '#8888FF', preview: ['#030308','#08080f'],  desc: '🔒 Ultra-dark prestige' },
]

export const EFFECTS = [
  { id: 'none',       label: 'No effect',   price: 0,   icon: '🚫', desc: 'Clean look' },
  { id: 'glow',       label: 'Glow aura',   price: 60,  icon: '✨', desc: 'Soft colour glow' },
  { id: 'pulse',      label: 'Pulse ring',  price: 80,  icon: '💓', desc: 'Animated pulsing ring' },
  { id: 'sparkle',    label: 'Sparkle',     price: 100, icon: '🌟', desc: 'Double ring shimmer' },
  { id: 'rainbow',    label: 'Rainbow',     price: 200, icon: '🌈', desc: 'Multi-colour ring' },
  { id: 'fire',       label: 'Fire',        price: 250, icon: '🔥', desc: 'Fiery orange aura' },
  { id: 'ice',        label: 'Ice',         price: 180, icon: '❄️', desc: 'Frosty blue shimmer' },
  { id: 'gold_ring',  label: 'Gold ring',   price: 220, icon: '👑', desc: 'Premium gold border' },
  { id: 'halo',       label: 'Halo',        price: 300, icon: '😇', desc: '🔒 Divine white halo' },
  { id: 'vortex',     label: 'Vortex',      price: 350, icon: '🌀', desc: '🔒 Rotating vortex ring' },
]

export const FRAMES = [
  { id: 'none',        label: 'No frame',     price: 0,   desc: 'Plain avatar' },
  { id: 'spin_green',  label: 'Spin · Green', price: 120, desc: 'Rotating green border' },
  { id: 'spin_gold',   label: 'Spin · Gold',  price: 150, desc: 'Rotating gold border' },
  { id: 'spin_rainbow',label: 'Rainbow spin', price: 220, desc: 'Rotating rainbow border' },
  { id: 'neon_pulse',  label: 'Neon pulse',   price: 180, desc: 'Pulsing neon border' },
  { id: 'fire_frame',  label: 'Fire frame',   price: 280, desc: '🔒 Animated fire border' },
  { id: 'galaxy',      label: 'Galaxy',       price: 350, desc: '🔒 Starfield orbit frame' },
]

export const BACKGROUNDS = [
  { id: 'none',        label: 'Default',        price: 0,   desc: 'Default dark background' },
  { id: 'stars',       label: 'Starfield',      price: 100, desc: 'Drifting stars' },
  { id: 'particles',   label: 'Particles',      price: 120, desc: 'Floating green particles' },
  { id: 'aurora',      label: 'Aurora',         price: 180, desc: 'Northern lights waves' },
  { id: 'matrix',      label: 'Matrix',         price: 200, desc: 'Falling green rain' },
  { id: 'bubbles',     label: 'Bubbles',        price: 150, desc: 'Rising floating bubbles' },
  { id: 'nebula',      label: 'Nebula',         price: 250, desc: '🔒 Deep space nebula' },
  { id: 'glitch',      label: 'Glitch',         price: 300, desc: '🔒 Cyberpunk glitch grid' },
]

export const BADGES = [
  { id: 'early_bird',  label: 'Early Bird',  price: 0,   icon: '🐦', desc: 'Founding member' },
  { id: 'social',      label: 'Social',      price: 80,  icon: '🤝', desc: 'Made 5+ friends' },
  { id: 'creator',     label: 'Creator',     price: 100, icon: '🎨', desc: 'Posted 10+ times' },
  { id: 'chatter',     label: 'Chatter',     price: 80,  icon: '💬', desc: 'Sent 50+ messages' },
  { id: 'photographer',label: 'Photographer',price: 120, icon: '📸', desc: 'Uploaded a profile photo' },
  { id: 'vip',         label: 'VIP',         price: 400, icon: '⭐', desc: '🔒 Exclusive VIP status' },
  { id: 'legend',      label: 'Legend',      price: 999, icon: '🏆', desc: '🔒 The ultimate badge' },
]

export async function completeTask(uid, taskId) {
  const task = TASKS.find(t => t.id === taskId)
  if (!task) return
  const snap = await getDoc(doc(db, 'users', uid))
  const done = snap.data()?.completedTasks || []
  if (done.includes(taskId)) return  
  await updateDoc(doc(db, 'users', uid), {
    completedTasks: arrayUnion(taskId),
    coins: increment(task.coins),
  })
}

export async function purchaseItem(uid, type, itemId, price) {
  const snap = await getDoc(doc(db, 'users', uid))
  const data = snap.data()
  if ((data.coins || 0) < price) throw new Error('Not enough coins')
  const update = { coins: increment(-price) }
  if (type === 'theme')   update.purchasedThemes  = arrayUnion(itemId)
  if (type === 'effect')  update.purchasedEffects = arrayUnion(itemId)
  if (type === 'frame')   update.purchasedFrames  = arrayUnion(itemId)
  if (type === 'bg')      update.purchasedBgs     = arrayUnion(itemId)
  if (type === 'badge')   update.purchasedBadges  = arrayUnion(itemId)
  await updateDoc(doc(db, 'users', uid), update)
}

export async function equipItem(uid, type, itemId) {
  const map = { theme:'equippedTheme', effect:'equippedEffect', frame:'equippedFrame', bg:'equippedBg', badge:'equippedBadge' }
  if (map[type]) await updateDoc(doc(db, 'users', uid), { [map[type]]: itemId })
}
