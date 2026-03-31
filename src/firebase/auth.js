import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

const DEFAULT_USER = {
  bio: '',
  avatarColor: '#1D9E75',
  avatarEmoji: '',
  avatarUrl: null,
  isPrivate: false,
  mood: null,
  friends: {},
  followers: [],
  following: [],
  coins: 0,
  completedTasks: [],
  purchasedThemes: ['default'],
  purchasedEffects: ['none'],
  purchasedFrames: ['none'],
  purchasedBgs: ['none'],
  purchasedBadges: ['early_bird'],
  equippedTheme: 'default',
  equippedEffect: 'none',
  equippedFrame: 'none',
  equippedBg: 'none',
  equippedBadge: '',
}

export async function registerUser(email, password, username) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const user = credential.user
  await updateProfile(user, { displayName: username })
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid, username, email,
    ...DEFAULT_USER,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'users', user.uid), {
    coins: 50,
    completedTasks: ['welcome'],
  })
  return user
}

export async function patchUserDoc(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return
    const d = snap.data()
    const patch = {}
    const fields = {
      coins: 0, completedTasks: [], avatarUrl: null,
      purchasedThemes: ['default'], purchasedEffects: ['none'],
      purchasedFrames: ['none'], purchasedBgs: ['none'],
      purchasedBadges: ['early_bird'],
      equippedTheme: 'default', equippedEffect: 'none',
      equippedFrame: 'none', equippedBg: 'none', equippedBadge: '',
    }
    Object.entries(fields).forEach(([k, v]) => { if (d[k] === undefined) patch[k] = v })
    if (!(d.completedTasks||[]).includes('welcome')) {
      patch.completedTasks = [...(d.completedTasks||[]), 'welcome']
      patch.coins = (d.coins||0) + 50
    }
    if (Object.keys(patch).length > 0) await updateDoc(doc(db, 'users', uid), patch)
  } catch (e) { console.warn('patchUserDoc:', e) }
}

export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  await patchUserDoc(credential.user.uid)
  return credential.user
}

export async function logoutUser() { await signOut(auth) }
