import { collection, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from './config'

export async function postStory(userId, username, avatarColor, avatarEmoji, content, mediaUrl, mediaType) {
  const expiresAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000)
  await addDoc(collection(db, 'stories'), {
    userId, username, avatarColor, avatarEmoji,
    content, mediaUrl, mediaType,
    expiresAt, createdAt: serverTimestamp(),
    viewers: [],
  })
}

export function subscribeToStories(callback) {
  const cutoff = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000)
  const q = query(collection(db, 'stories'), where('createdAt', '>', cutoff), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
