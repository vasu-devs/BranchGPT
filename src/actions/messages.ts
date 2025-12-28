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
 * Create a NEW conversation (always creates a new root branch)
 */
export async function createConversation(
    systemPrompt?: string
): Promise<{ branch: typeof branches.$inferSelect; rootMessage?: Message }> {
    const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });

    // ALWAYS create a new branch for a new conversation
    const [mainBranch] = await db
        .insert(branches)
        .values({
            name: `Chat ${timestamp}`,
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
 * Get all conversations (Root branches)
 */
export async function getConversations() {
    return db.query.branches.findMany({
        where: isNull(branches.parentBranchId),
        orderBy: (branches, { desc }) => [desc(branches.createdAt)],
    });
}

/**
 * Get all branches belonging to a specific conversation tree
 */
export async function getBranchTree(rootBranchId: string) {
    // Recursive query would be ideal but for now we fetch all and filter in app
    // or we can do a multi-level fetch.
    // Given the depth isn't massive yet, fetching all branches and filtering
    // by connectivity in JS/application layer is safest/easiest without CTEs.
    // OR: we fetch all branches and reconstruct the tree.
    
    // For now, let's fetch ALL branches and we will filter in component or here.
    // Actually, let's fetch all branches and filter for those descending from rootBranchId.
    
    // To do this efficiently without CTEs is hard in one query.
    // Let's just return ALL branches for now and let the frontend filter,
    // which is what getAllBranches did.
    // BUT we need to optimize this.
    
    return db.query.branches.findMany({
        orderBy: (branches, { asc }) => [asc(branches.createdAt)],
    });
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

/**
 * Delete a branch and its messages
 */
export async function deleteBranch(branchId: string): Promise<void> {
    // Due to CASCADE on foreign keys, deleting the branch should delete messages
    // BUT we should also delete child branches recursively if we want a full clean up
    // However, the schema definition:
    // branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" })
    // This handles messages.
    // 
    // For child branches:
    // We don't have explicit cascade in schema definition in this file for `branches` self-reference?
    // Let's check schema.ts. If not, we might orphan them.
    // 
    // Safest approach is to find all children and delete them recursively first.
    
    // 1. Find children
    const children = await db.query.branches.findMany({
        where: eq(branches.parentBranchId, branchId)
    });
    
    // 2. Delete children recursively
    for (const child of children) {
        await deleteBranch(child.id);
    }
    
    // 3. Delete this branch
    await db.delete(branches).where(eq(branches.id, branchId));
}
