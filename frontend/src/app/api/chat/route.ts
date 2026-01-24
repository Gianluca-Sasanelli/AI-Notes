import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from "ai"
import { type NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"

import { runAssistantAgent } from "@/lib/agents/basic-agent"
import { getModelInstance } from "@/lib/agents/models"
import { ChatUIMessage, chatRequestSchema } from "@/lib/types/chat-types"
import { createChat, updateChat } from "@/db"
import RetrieveContex from "@/lib/agents/context/context"
import { RemoteReasoning } from "@/lib/utils"

export const dynamic = "force-dynamic"
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const json = await req.json()
  const parseResult = chatRequestSchema.safeParse(json)
  if (!parseResult.success) {
    console.error("The request is not valid")
    console.error("The parse result is ", parseResult)
    console.error("The json is ", json)
    return new Response("Bad Request", {
      status: 400
    })
  }

  const { messages, id: chatId, model, context } = parseResult.data
  console.log("The context received is", context)
  const { model: modelInstance, hasReasoning } = getModelInstance(model)
  const isFirstUserMessage = messages.length === 1 && messages[0].role === "user"

  let ServerMessages = await convertToModelMessages(messages, {
    ignoreIncompleteToolCalls: true
  })
  if (!hasReasoning) {
    ServerMessages = RemoteReasoning(ServerMessages)
  }
  const RetrievedContext = await RetrieveContex(context, userId)
  let hasError = false

  const response = createUIMessageStreamResponse({
    status: 200,
    stream: createUIMessageStream<ChatUIMessage>({
      originalMessages: messages,
      async execute({ writer }) {
        writer.write({
          type: "data-ai-status",
          data: {
            frontend_message: "Thinking..."
          }
        })
        const streamAssistant = await runAssistantAgent(
          ServerMessages,
          modelInstance,
          RetrievedContext
        )
        writer.merge(streamAssistant.toUIMessageStream())
      },
      onError: (error) => {
        hasError = true
        if (error instanceof Error && error.message && error.message.length < 250) {
          console.error("The error message is", error.message)
          return error.message
        }
        console.error("The error is", error)
        return "An error has occurred while executing the strategy"
      },
      onFinish: async ({ messages }) => {
        console.info("ON FINISH CALLED")

        if (hasError) {
          console.warn("hasError is true. Returning early")
          return
        }

        if (isFirstUserMessage) {
          try {
            await createChat(userId, chatId, messages, ServerMessages)
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error)
            console.error("Error creating chat", errorMsg)
          }
          return
        }

        try {
          await updateChat(userId, chatId, messages)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          console.error(
            "Error saving chat",
            errorMsg.length > 400 ? errorMsg.slice(0, 400) + "..." : errorMsg
          )
        }
        return
      }
    })
  })
  return response
}
