import { AssistantResponse } from 'ai';
import OpenAI from 'openai';

console.log("🔄 Initializing OpenAI...");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export const maxDuration = 30;

export async function POST(req: Request) {
    const input: {
        threadId: string | null;
        message: string;
        language: string;
        style: string;
    } = await req.json();

    console.log("📥 Request received:", input);

    const enrichedMessage = `${input.message} Please respond in ${input.language} for all parts of the response, except for keywords for illustrations and icon names in tags which should remain in English. Ensure that the title of the diagram, the names of elements, and the names of tags are all in ${input.language}. Only the keywords for illustrations and the icon names in tags should remain in English. Additionally, include the property "language" in the response JSON to indicate the language of the diagram. Also, ensure that the illustrations use the style ${input.style} when searching in the file and only use this style ${input.style}.`;

    let threadId = input.threadId;
    if (!threadId) {
        const createdThread = await openai.beta.threads.create({});
        threadId = createdThread.id;
        console.log("🧵 Thread created:", threadId);
    }

    const createdMessage = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: enrichedMessage,
    });
    console.log("💬 Message added to thread:", createdMessage);

    return AssistantResponse(
        { threadId, messageId: createdMessage.id },
        async ({ forwardStream, sendDataMessage }) => {
            console.log("🚀 Running assistant...");
            const runStream = openai.beta.threads.runs.stream(threadId, {
                assistant_id:
                    process.env.ASSISTANT_ID ??
                    (() => {
                        throw new Error('ASSISTANT_ID is not set');
                    })(),
            });

            let runResult = await forwardStream(runStream);
            console.log("🔄 Initial run result status:", runResult?.status);

            while (
                runResult?.status === 'requires_action' &&
                runResult.required_action?.type === 'submit_tool_outputs'
            ) {
                const tool_outputs =
                    runResult.required_action.submit_tool_outputs.tool_calls.map(
                        (toolCall: any) => {
                            const parameters = JSON.parse(toolCall.function.arguments);
                            console.log("🔧 Tool call parameters:", parameters);

                            switch (toolCall.function.name) {
                                default:
                                    throw new Error(
                                        `Unknown tool call function: ${toolCall.function.name}`,
                                    );
                            }
                        },
                    );

                runResult = await forwardStream(
                    openai.beta.threads.runs.submitToolOutputsStream(
                        threadId,
                        runResult.id,
                        { tool_outputs },
                    ),
                );
                console.log("🔄 Updated run result status:", runResult?.status);
            }
        },
    );
}
