import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ChatInit from "@/components/chat/ChatInit"
import { getChat } from "@/db/db-functions"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/")
  }

  const { id } = await params
  const chat = await getChat(userId, id)

  return <ChatInit chatId={id} storedmessages={chat?.messages ?? []} />
}
