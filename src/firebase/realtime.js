
import { ref, push, onValue, off, serverTimestamp } from 'firebase/database'
import { rtdb } from './config'

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}


export async function sendMessage(chatId, senderId, senderName, content, type = 'text') {
  const chatRef = ref(rtdb, `chats/${chatId}/messages`)
  await push(chatRef, {
    senderId,
    senderName,
    content,           
    text: content,    
    type,
    timestamp: serverTimestamp(),
  })
}

export function subscribeToChat(chatId, callback) {
  const chatRef = ref(rtdb, `chats/${chatId}/messages`)
  onValue(chatRef, snap => {
    const data = snap.val()
    const messages = data
      ? Object.entries(data).map(([id, msg]) => ({ id, ...msg }))
      : []
    callback(messages)
  })
  return () => off(chatRef)
}
