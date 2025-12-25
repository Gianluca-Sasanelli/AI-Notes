import ChatInit from "@/components/chat/ChatInit"
import { getChat } from "@/db/db-functions"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const chat = await getChat(id)

  return <ChatInit chatId={id} storedmessages={chat?.messages ?? []} />
}
