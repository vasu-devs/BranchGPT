"use server";

import { db, messages, branches, type Message, type NewMessage, type NewBranch } from "@/db";
import { eq, and, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Recursively fetches the conversation history from a node back to root.
 * Returns messages in chronological order [Root -> ... -> Node]
 */
export async function getConversationHistory(nodeId: string): Promise<Message[]> {
    const history: Message[] = [];
    let currentId: string | null = nodeId;

    // Traverse up the tree collecting messages
    while (currentId) {
        const message: Message | undefined = await db.query.messages.findFirst({
            where: eq(messages.id, currentId),
        });

        if (!message) break;

        history.unshift(message); // Add to beginning for chronological order
        currentId = message.parentId;
    }

    return history;
}

/**
 * Get all children (siblings when viewed from parent) of a message
 */
export async function getMessageChildren(parentId: string): Promise<Message[]> {
    return db.query.messages.findMany({
        where: eq(messages.parentId, parentId),
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
}

/**
 * Get siblings of a message (other children of the same parent)
 */
export async function getMessageSiblings(messageId: string): Promise<{
    siblings: Message[];
    currentIndex: number;
}> {
    const message = await db.query.messages.findFirst({
        where: eq(messages.id, messageId),
    });

    if (!message || !message.parentId) {
        return { siblings: [], currentIndex: -1 };
    }

    const siblings = await db.query.messages.findMany({
        where: eq(messages.parentId, message.parentId),
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    const currentIndex = siblings.findIndex((s) => s.id === messageId);
    return { siblings, currentIndex };
}

/**
 * Create a new message in the conversation tree
 */
export async function createMessage(
    data: Omit<NewMessage, "id" | "createdAt">
): Promise<Message> {
    // If there's a parent, unset its head status
    if (data.parentId) {
        await db
            .update(messages)
            .set({ isHead: false })
            .where(and(eq(messages.branchId, data.branchId), eq(messages.isHead, true)));
    }

    const [newMessage] = await db
        .insert(messages)
        .values({
            ...data,
            isHead: true,
        })
        .returning();

    return newMessage;
}

/**
 * Create a new branch and message (fork from existing conversation)
 */
export async function forkConversation(
    sourceNodeId: string,
    newContent: string,
    role: "user" | "assistant" | "system" = "user",
    branchName?: string
): Promise<{ branch: typeof branches.$inferSelect; message: Message }> {
    const sourceMessage = await db.query.messages.findFirst({
        where: eq(messages.id, sourceNodeId),
        with: { branch: true },
    });

    if (!sourceMessage) {
        throw new Error("Source message not found");
    }

    // Create new branch
    const [newBranch] = await db
        .insert(branches)
        .values({
            name: branchName || `Branch ${Date.now()}`,
            rootMessageId: sourceNodeId,
            parentBranchId: sourceMessage.branchId,
        })
        .returning();

    // Create first message in new branch
    const newMessage = await createMessage({
        content: newContent,
        role,
        parentId: sourceNodeId,
        branchId: newBranch.id,
        isHead: true,
    });

    return { branch: newBranch, message: newMessage };
}

/**
 * Initialize conversation - returns existing main branch or creates new one
 */
export async function initializeConversation(
    systemPrompt?: string
): Promise<{ branch: typeof branches.$inferSelect; rootMessage?: Message }> {
    // First, check if a main branch already exists
    const existingBranch = await db.query.branches.findFirst({
        where: eq(branches.name, "main"),
        orderBy: (branches, { desc }) => [desc(branches.createdAt)],
    });

    if (existingBranch) {
        // Return existing branch with its head message
        const head = await getBranchHead(existingBranch.id);
        return { branch: existingBranch, rootMessage: head || undefined };
    }

    // Create main branch if none exists
    const [mainBranch] = await db
        .insert(branches)
        .values({
            name: "main",
            rootMessageId: null,
            parentBranchId: null,
        })
        .returning();

    let rootMessage: Message | undefined;

    if (systemPrompt) {
        rootMessage = await createMessage({
            content: systemPrompt,
            role: "system",
            parentId: null,
            branchId: mainBranch.id,
            isHead: true,
        });
    }

    return { branch: mainBranch, rootMessage };
}

/**
 * Get the current head message of a branch
 */
export async function getBranchHead(branchId: string): Promise<Message | null> {
    const head = await db.query.messages.findFirst({
        where: and(eq(messages.branchId, branchId), eq(messages.isHead, true)),
    });

    return head || null;
}

/**
 * Get all branches
 */
export async function getAllBranches() {
    return db.query.branches.findMany({
        orderBy: (branches, { asc }) => [asc(branches.createdAt)],
    });
}

/**
 * Merge branch - summarizes branch content and appends to target branch
 */
export async function prepareMergeContext(branchId: string): Promise<{
    history: Message[];
    branchName: string;
}> {
    const branch = await db.query.branches.findFirst({
        where: eq(branches.id, branchId),
    });

    if (!branch) {
        throw new Error("Branch not found");
    }

    const head = await getBranchHead(branchId);
    if (!head) {
        throw new Error("Branch has no messages");
    }

    const history = await getConversationHistory(head.id);

    return { history, branchName: branch.name };
}

/**
 * Format conversation history for LLM context
 */
export async function formatHistoryForLLM(
    nodeId: string
): Promise<Array<{ role: "user" | "assistant" | "system"; content: string }>> {
    const history = await getConversationHistory(nodeId);

    return history.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));
}
