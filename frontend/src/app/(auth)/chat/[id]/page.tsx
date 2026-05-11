import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ChatInit from "@/components/chat/ChatInit"
import { convex } from "@/lib/convex-server"
import { api } from "@convex/_generated/api"
import ChatErrorPage from "./error"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  const { id } = await params
  const chat = await convex.query(api.chats.getChat, { userId, clientId: id })
  if (!chat) {
    return <ChatErrorPage error={{ name: "ChatError", message: "Chat not found" }} />
  }
  console.log("Chat fetched", chat)
  return <ChatInit chatId={id} storedmessages={chat.messages} />
}
