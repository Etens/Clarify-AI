import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
console.log("API Key: ", process.env.OPENAI_API_KEY);

interface IAExample {
  user_prompt: string;
  ia_response: {
    data?: {
      title: string;
      elements: Array<{
        ElementName: string;
        Keywords: string;
        Explanation: string;
      }>;
      tags: {
        general: string;
        specific: string;
        icon: string;
      };
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
        ElementName: string;
        Keywords: string;
        Explanation: string;
      }>;
      tags: {
        general: string;
        specific: string;
        icon: string;
      };
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
    `Objective of the response: Type - ${aiInstructionsData.response_format.type}, Title - ${aiInstructionsData.response_format.data.title}, ` +
    `Elements - ${aiInstructionsData.response_format.data.elements.map(element =>
      `ElementName: ${element.ElementName}, Keywords: ${element.Keywords}, Explanation: ${element.Explanation}`
    ).join(", ")}\n` +
    `Tags: General - ${aiInstructionsData.response_format.data.tags.general}, Specific - ${aiInstructionsData.response_format.data.tags.specific}, Icon - ${aiInstructionsData.response_format.data.tags.icon}\n` +
    `Language Style: Tone - ${aiInstructionsData.language_style.tone}, Complexity - ${aiInstructionsData.language_style.complexity}\n` +
    `Examples of Prompt: ${aiInstructionsData.examples.map(example => `User Prompt: ${example.user_prompt}, Response: ${JSON.stringify(example.ia_response.data)}`).join(", ")}\n` +
    `Best Practices: ${aiInstructionsData.best_practices.join(", ")}\n` +
    `Pitfalls to Avoid: ${aiInstructionsData.pitfalls_to_avoid.join(", ")}\n`
};

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages } = await req.json();
  const language = session.user?.language || 'en';

  const languageInstruction = {
    role: "system",
    content: `Please respond in ${language} for all parts of the response, except for keywords and tags which should remain in English. Ensure that the text generated for each element is in ${language} and the keywords and tags are in English.`
  };

  const messagesWithInstructions = [...messages, instructionMessage, languageInstruction];
  console.log("Messages with instructions: ", messagesWithInstructions);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: messagesWithInstructions,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
