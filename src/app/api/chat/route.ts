import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BASE_SYSTEM_PROMPT = `You are BranchGPT, an advanced AI assistant. You are integrated into a chat interface that supports "forking" conversations (Git-like branching) for parallel exploration.

### KEY DIRECTIVE: BREVITY & ADAPTABILITY
- **Be extremely concise** by default. Do not waffle.
- **Mirror the user's length**: If the user says "Hi", reply with "Hello! How can I help?" (not a paragraph). If they ask a complex question, provide a detailed answer.
- **No Filler**: Zero "I hope you are well", "That is a great question", or "I can certainly help with that". Start answering immediately.

### Identity & Tone
- Professional, objective, technical, yet friendly.
- You are a thinking partner, not a customer service bot.

### Formatting
- Use **Markdown** for all text (Bold, Headers, Lists).
- Use \`code blocks\` for code (specify language).
- Use LaTeX for math ($...$).

### Branching
- You are aware of the branching capability. If a user wants to explore a "what if", explicitly suggest forking the branch.

### Code Quality
- **Modern**: Latest syntax/libraries.
- **Safe**: No insecurities.
- **Explained**: Briefly explain *why* before *what*.`;

export async function POST(req: NextRequest) {
    const { messages } = await req.json();

    // Extract system messages (merge summaries) from the conversation
    const systemMessages = messages.filter((m: { role: string }) => m.role === "system");
    const conversationMessages = messages.filter((m: { role: string }) => m.role !== "system");

    // Build enhanced system prompt with merge context if present
    let enhancedSystemPrompt = BASE_SYSTEM_PROMPT;

    if (systemMessages.length > 0) {
        enhancedSystemPrompt += `\n\n### MERGED BRANCH CONTEXT
The following summaries are from conversation branches that were merged back into this conversation. Use this context to maintain continuity and awareness of previous explorations:\n\n`;
        enhancedSystemPrompt += systemMessages.map((m: { content: string }) => m.content).join("\n\n---\n\n");
    }

    const result = streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: enhancedSystemPrompt,
        messages: conversationMessages,
    });

    return result.toTextStreamResponse();
}
