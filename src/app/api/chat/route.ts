import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { messages } = await req.json();

    const result = streamText({
        model: openai("gpt-4o-mini"),
        system: `You are a helpful AI assistant in BranchGPT, a chat application that works like Git. 
Users can fork conversations at any point to explore different directions without polluting the main context.
Be concise, helpful, and engaging. When relevant, acknowledge the branching nature of the conversation.`,
        messages,
    });

    return result.toDataStreamResponse();
}
