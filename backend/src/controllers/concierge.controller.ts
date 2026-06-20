import type { Request, Response } from 'express'
import { z } from 'zod'
import { ok } from '../lib/response'
import { ApiError } from '../lib/ApiError'
import { geminiChat, isGeminiConfigured, type ChatTurn } from '../lib/gemini'

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(40),
})

// GET /concierge/status — lets the UI know if the AI is configured
export async function status(_req: Request, res: Response): Promise<void> {
  ok(res, { enabled: isGeminiConfigured() })
}

// POST /concierge/chat — send the conversation, get the assistant's reply
export async function chat(req: Request, res: Response): Promise<void> {
  if (!isGeminiConfigured()) {
    throw ApiError.badRequest(
      'The AI Concierge is not configured yet. Add GEMINI_API_KEY to backend/.env (free key at https://aistudio.google.com/app/apikey) and restart the server.'
    )
  }
  const { messages } = req.body as { messages: ChatTurn[] }
  try {
    const reply = await geminiChat(messages)
    ok(res, { reply })
  } catch (e) {
    throw new ApiError(502, e instanceof Error ? e.message : 'AI service error')
  }
}
