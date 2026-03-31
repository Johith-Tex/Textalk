import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { updatePassword, updateEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { db, auth } from './config'

export async function updateAccountSettings({ uid, username, bio, avatarColor, avatarEmoji, isPrivate, mood }) {
  const data = {}
  if (username  !== undefined) data.username  = username
  if (bio       !== undefined) data.bio       = bio
  if (avatarColor !== undefined) data.avatarColor = avatarColor
  if (avatarEmoji !== undefined) data.avatarEmoji = avatarEmoji
  if (isPrivate !== undefined) data.isPrivate = isPrivate
  if (mood      !== undefined) data.mood      = mood
  await updateDoc(doc(db, 'users', uid), data)
}

export async function setMood(uid, mood) {
  await updateDoc(doc(db, 'users', uid), {
    mood: mood ? { ...mood, setAt: Date.now() } : null
  })
}

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser
  const cred = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, cred)
  await updatePassword(user, newPassword)
}
