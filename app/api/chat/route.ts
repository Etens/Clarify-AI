import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
console.log("API Key: ", process.env.OPENAI_API_KEY)

export async function POST(req: Request) {
  const { messages } = await req.json()
  console.log("Messages: ", messages)

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages
  })

  const stream = OpenAIStream(response)
  console.log("Response: ", stream)

  return new StreamingTextResponse(stream)
}