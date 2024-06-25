import { AssistantResponse } from 'ai';
import OpenAI from 'openai';

console.log("🔄 Initializing OpenAI...");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    // Parse the request body
    const input: {
        threadId: string | null;
        message: string;
        language: string; // Ajout du paramètre de langue
        style: string; // Ajout du paramètre de style
    } = await req.json();

    console.log("📥 Request received:", input);  // Log the received request

    // Ajouter les informations de langage et de style au message
    const enrichedMessage = `${input.message} Please respond in ${input.language} for all parts of the response, except for keywords for illustrations and icon names in tags which should remain in English. Ensure that the title of the diagram, the names of elements, and the names of tags are all in ${input.language}. Only the keywords for illustrations and the icon names in tags should remain in English. Additionally, include the property "language" in the response JSON to indicate the language of the diagram. Also, ensure that the illustrations use the style ${input.style} when searching in the file and only use this style ${input.style}.`;

    // Create a thread if needed
    let threadId = input.threadId;
    if (!threadId) {
        const createdThread = await openai.beta.threads.create({});
        threadId = createdThread.id;
        console.log("🧵 Thread created:", threadId);  // Log the created thread ID
    }

    // Add a message to the thread
    const createdMessage = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: enrichedMessage,
    });
    console.log("💬 Message added to thread:", createdMessage);  // Log the added message

    return AssistantResponse(
        { threadId, messageId: createdMessage.id },
        async ({ forwardStream, sendDataMessage }) => {
            // Run the assistant on the thread
            console.log("🚀 Running assistant...");  // Log running the assistant
            const runStream = openai.beta.threads.runs.stream(threadId, {
                assistant_id:
                    process.env.ASSISTANT_ID ??
                    (() => {
                        throw new Error('ASSISTANT_ID is not set');
                    })(),
            });

            // forward run status would stream message deltas
            let runResult = await forwardStream(runStream);
            console.log("🔄 Initial run result status:", runResult?.status);  // Log the initial run result status

            // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
            while (
                runResult?.status === 'requires_action' &&
                runResult.required_action?.type === 'submit_tool_outputs'
            ) {
                const tool_outputs =
                    runResult.required_action.submit_tool_outputs.tool_calls.map(
                        (toolCall: any) => {
                            const parameters = JSON.parse(toolCall.function.arguments);
                            console.log("🔧 Tool call parameters:", parameters);  // Log the tool call parameters

                            switch (toolCall.function.name) {
                                // configure your tool calls here
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
                console.log("🔄 Updated run result status:", runResult?.status);  // Log the updated run result status
            }
        },
    );
}
