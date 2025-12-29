"use client"

import ChatInit from "@/components/chat/ChatInit"

export default function NewChatPage() {
  const newChatKey = crypto.randomUUID()
  return <ChatInit key={newChatKey} chatId={null} storedmessages={[]} />
}
