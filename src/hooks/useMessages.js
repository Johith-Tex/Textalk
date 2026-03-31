import { useState, useEffect } from 'react'
import { subscribeToChat, getChatId } from '../firebase/realtime'

export function useMessages(uid1, uid2) {
  const [messages, setMessages] = useState([])
  useEffect(() => {
    if (!uid1 || !uid2) return
    const chatId = getChatId(uid1, uid2)
    return subscribeToChat(chatId, msgs => {
      setMessages([...msgs].sort((a,b)=>(a.timestamp||0)-(b.timestamp||0)))
    })
  }, [uid1, uid2])
  return messages
}
