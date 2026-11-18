import type { Content, Part } from '@google/generative-ai'
import { z } from 'zod'

const part = z.union([
  z.object({ text: z.string().min(1).max(100000) }).strict(),
  z.object({ inlineData: z.object({ mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']), data: z.string().min(1).max(6000000) }).strict() }).strict(),
])
const parts = z.array(part).min(1).max(32)
const conversation = z.array(z.object({ role: z.enum(['user', 'model']), parts }).strict()).min(1).max(40)

/** Normalize the three legacy callers: text, {parts}, and [text, imagePart]. */
export function normalizeLegacyContents(input: unknown): Content[] {
  if (typeof input === 'string') return [{ role: 'user', parts: [part.parse({ text: input }) as Part] }]
  if (Array.isArray(input)) {
    if (input.length && input.every(item => item && typeof item === 'object' && 'role' in item)) return conversation.parse(input) as Content[]
    return [{ role: 'user', parts: parts.parse(input.map(item => typeof item === 'string' ? { text: item } : item)) as Part[] }]
  }
  const content = z.object({ parts }).strict().parse(input)
  return [{ role: 'user', parts: content.parts as Part[] }]
}

export function planningImageContents(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string; imageData?: { mimeType: string; data: string } }>): Content[] {
  return normalizeLegacyContents(messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }, ...(message.imageData ? [{ inlineData: message.imageData }] : [])],
  })))
}
