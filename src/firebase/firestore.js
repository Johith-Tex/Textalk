import {
  collection, addDoc, deleteDoc, doc,
  query, orderBy, serverTimestamp,
  onSnapshot, updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from './config'

export async function createPost(userId, username, content, media=null, song=null, poll=null) {
  await addDoc(collection(db, 'posts'), {
    userId, username, content,
    likes: [],
    mediaUrl:  media?.url  || null,
    mediaType: media?.type || null,
    mediaMeta: media?.meta || null,
    song:      song        || null,
    poll:      poll        || null,
    createdAt: serverTimestamp(),
  })
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, 'posts', postId))
}

export async function toggleLike(postId, uid, liked) {
  await updateDoc(doc(db, 'posts', postId), {
    likes: liked ? arrayRemove(uid) : arrayUnion(uid),
  })
}

export async function votePoll(postId, optionIndex, uid) {
  const ref = doc(db, 'posts', postId)
 
  const snap = await import('firebase/firestore').then(m => m.getDoc(ref))
  const data = snap.data()
  if (!data?.poll) return
  const updated = data.poll.options.map((o, i) => ({
    ...o, votes: i === optionIndex ? [...new Set([...(o.votes||[]), uid])] : (o.votes||[]).filter(v => v !== uid),
  }))
  await updateDoc(ref, { 'poll.options': updated })
}

export function subscribeToFeed(callback) {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
