import { env, geminiConfigured } from '../config/env'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are the AI Concierge for "Luxe Grand", a 5-star luxury hotel with 280 rooms across 10 floors.
Room tiers: Standard, Deluxe, Suite, Presidential, Penthouse. Amenities include a spa, fine-dining restaurant,
event ballrooms, airport transfers, and 24/7 concierge service.
You help guests and staff with: room recommendations, booking guidance, local recommendations, amenities,
dining, special requests, and general hospitality questions.
Be warm, concise, and elegant — the tone of a world-class concierge. Keep replies short (2-4 sentences) unless
asked for detail. If asked something outside hotel scope, answer briefly and steer back to how you can help.`

export const isGeminiConfigured = () => geminiConfigured

/**
 * Calls the Gemini REST API directly (no SDK dependency). Returns the reply text.
 * Throws if the API key is missing or the request fails.
 */
export async function geminiChat(history: ChatTurn[]): Promise<string> {
  if (!geminiConfigured) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`

  const contents = history.map((t) => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: t.content }],
  }))

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemini request failed (${res.status}): ${detail.slice(0, 300)}`)
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''
  return text.trim() || 'I apologize, I could not formulate a response just now.'
}
