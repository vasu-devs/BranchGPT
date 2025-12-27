import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { messages } = await req.json();

    const result = streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: `You are a helpful AI assistant in BranchGPT, a chat application that works like Git. 
Users can fork conversations at any point to explore different directions without polluting the main context.
Be concise, helpful, and engaging. When relevant, acknowledge the branching nature of the conversation.`,
        messages,
    });

    return result.toTextStreamResponse();
}
