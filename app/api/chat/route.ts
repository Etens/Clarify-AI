import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface IAExample {
  user_prompt: string;
  ia_response: {
    data?: {
      title: string;
      elements: Array<{
        illustration: string;
        title: string;
        explanation: string;
      }>;
    };
  };
}

interface IAInstructionsData {
  role: string;
  description: string;
  response_format: {
    type: string;
    data: {
      title: string;
      elements: Array<{
        illustration_keyword: string;
        explanation: string;
      }>;
    };
  };
  language_style: {
    tone: string;
    complexity: string;
  };
  examples: IAExample[];
  best_practices: string[];
  pitfalls_to_avoid: string[];
}

const aiInstructionsData: IAInstructionsData = require("./instructions.json");

const instructionMessage = {
  role: "system",
  content: `Role: ${aiInstructionsData.role}\n` +
    `Description: ${aiInstructionsData.description}\n` +
    `Objectif de la réponse: Type - ${aiInstructionsData.response_format.type}, Titre - ${aiInstructionsData.response_format.data.title}, Éléments - ${aiInstructionsData.response_format.data.elements.map(element => `${element.illustration_keyword} \n ${element.explanation}`).join(", ")}\n` +
    `Style de Langage: Ton - ${aiInstructionsData.language_style.tone}, Complexité - ${aiInstructionsData.language_style.complexity}\n` +
    `Exemples de Prompt: ${aiInstructionsData.examples.map(example => `Prompt Utilisateur: ${example.user_prompt}`).join(", ")}\n` +
    `Pratiques recommandées: ${aiInstructionsData.best_practices.join(", ")}\n` +
    `Pièges à éviter: ${aiInstructionsData.pitfalls_to_avoid.join(", ")}\n`
};

console.log(instructionMessage.content);

console.log("API Key: ", process.env.OPENAI_API_KEY)

export async function POST(req: Request) {
  const { messages } = await req.json()
  console.log("Messages: ", messages)

  const messagesWithInstructions = [...messages, instructionMessage]
  console.log("Messages with Instructions: ", messagesWithInstructions)

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messagesWithInstructions,
  })

  const stream = OpenAIStream(response)
  console.log("Response: ", stream)

  return new StreamingTextResponse(stream)
}