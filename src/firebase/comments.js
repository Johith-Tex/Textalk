import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { db } from './config'

export async function addComment(postId, userId, username, text) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    userId, username, text, createdAt: serverTimestamp(),
  })
}

export function subscribeToComments(postId, callback) {
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export async function deleteComment(postId, commentId) {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
}
