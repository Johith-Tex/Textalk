
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from './config'

export async function updateUserProfile({ uid, displayName, bio, avatarColor, avatarEmoji }) {
  const data = {}
  if (bio          !== undefined) data.bio          = bio
  if (avatarColor  !== undefined) data.avatarColor  = avatarColor
  if (avatarEmoji  !== undefined) data.avatarEmoji  = avatarEmoji
  if (displayName  !== undefined) {
    data.username = displayName
    if (auth.currentUser) await updateProfile(auth.currentUser, { displayName })
  }
  await updateDoc(doc(db, 'users', uid), data)
}
