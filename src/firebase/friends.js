
import {
  collection, addDoc, query, where, onSnapshot,
  doc, updateDoc, deleteDoc, getDoc, getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'


export async function sendFriendRequest(fromUid, fromUsername, toUid, toUsername) {
  
  const q = query(
    collection(db, 'friendRequests'),
    where('fromUid', '==', fromUid),
    where('toUid', '==', toUid),
  )
  const existing = await getDocs(q)
  if (!existing.empty) return

  await addDoc(collection(db, 'friendRequests'), {
    fromUid, fromUsername,
    toUid, toUsername,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}


export async function acceptFriendRequest(requestId, fromUid, fromUsername, toUid, toUsername) {
  
  await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' })

 
  await updateDoc(doc(db, 'users', toUid),   { [`friends.${fromUid}`]: fromUsername })
  await updateDoc(doc(db, 'users', fromUid), { [`friends.${toUid}`]:   toUsername   })
}


export async function declineFriendRequest(requestId) {
  await deleteDoc(doc(db, 'friendRequests', requestId))
}


export async function removeFriend(myUid, friendUid) {
  const myRef     = doc(db, 'users', myUid)
  const friendRef = doc(db, 'users', friendUid)
  const mySnap     = await getDoc(myRef)
  const friendSnap = await getDoc(friendRef)

  if (mySnap.exists()) {
    const friends = { ...mySnap.data().friends }
    delete friends[friendUid]
    await updateDoc(myRef, { friends })
  }
  if (friendSnap.exists()) {
    const friends = { ...friendSnap.data().friends }
    delete friends[myUid]
    await updateDoc(friendRef, { friends })
  }
}


export function subscribeToIncomingRequests(uid, callback) {
  const q = query(
    collection(db, 'friendRequests'),
    where('toUid', '==', uid),
    where('status', '==', 'pending'),
  )
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}


export function subscribeToSentRequests(uid, callback) {
  const q = query(
    collection(db, 'friendRequests'),
    where('fromUid', '==', uid),
    where('status', '==', 'pending'),
  )
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}
