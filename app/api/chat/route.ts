import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

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
    `Language Style: Tone - ${aiInstructionsData.language_style.tone}, Complexity - ${aiInstructionsData.language_style.complexity}\n` +
    `Examples of Prompt: ${aiInstructionsData.examples.map(example => `User Prompt: ${example.user_prompt}, Response: ${JSON.stringify(example.ia_response.data)}`).join(", ")}\n` +
    `Best Practices: ${aiInstructionsData.best_practices.join(", ")}\n` +
    `Pitfalls to Avoid: ${aiInstructionsData.pitfalls_to_avoid.join(", ")}\n`
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  const messagesWithInstructions = [...messages, instructionMessage];
  console.log("Messages with instructions: ", messagesWithInstructions);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: messagesWithInstructions,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
