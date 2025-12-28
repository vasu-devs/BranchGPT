"use server";

import { db, messages, branches, type Message, type NewMessage, type NewBranch } from "@/db";
import { eq, and, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { cookies } from "next/headers";

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
    } else {
        // If no parent (root message), ensure no other heads exist ensuring single head safety
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

    const cookieStore = await cookies();
    const userId = cookieStore.get("branchgpt-userid")?.value || "legacy";

    // Create new branch
    const [newBranch] = await db
        .insert(branches)
        .values({
            name: branchName || `Branch ${Date.now()}`,
            rootMessageId: sourceNodeId,
            parentBranchId: sourceMessage.branchId,
            userId,
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

    const cookieStore = await cookies();
    const userId = cookieStore.get("branchgpt-userid")?.value || "legacy";

    // ALWAYS create a new branch for a new conversation
    const [mainBranch] = await db
        .insert(branches)
        .values({
            name: `Chat ${timestamp}`,
            rootMessageId: null,
            parentBranchId: null,
            userId,
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
    const cookieStore = await cookies();
    const userId = cookieStore.get("branchgpt-userid")?.value || "legacy";

    return db.query.branches.findMany({
        where: and(isNull(branches.parentBranchId), eq(branches.userId, userId)),
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
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
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

/**
 * Generate a concise title for a branch based on the first message
 */
export async function generateBranchTitle(content: string): Promise<string> {
    try {
        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: "You are a helpful assistant. Generate a concise (3-5 words) title for a conversation branch starting with the following user message. Do not use quotes.",
            prompt: content,
        });
        return text.trim();
    } catch (error) {
        console.error("Failed to generate branch title:", error);
        return "New Branch";
    }
}

/**
 * Update the name of a branch
 */
export async function updateBranchName(branchId: string, name: string): Promise<void> {
    await db.update(branches).set({ name }).where(eq(branches.id, branchId));
}

/**
 * Merge a branch back into its parent
 * Appends a transcript of the branch to the parent and marks it as merged.
 */
export async function mergeBranch(branchId: string): Promise<string> {
    // 1. Get branch details
    const branch = await db.query.branches.findFirst({
        where: eq(branches.id, branchId),
    });

    if (!branch || !branch.parentBranchId) {
        throw new Error("Cannot merge: Branch not found or is a root branch");
    }

    // 2. Get history
    const { history, branchName } = await prepareMergeContext(branchId);

    // 3. Format transcript
    const transcript = history.map(msg => `**${msg.role.toUpperCase()}**: ${msg.content}`).join("\n\n");
    const mergeContent = `Has merged branch "**${branchName}**".\n\n### Transcript:\n${transcript}`;

    // 4. Create new message in parent branch
    // Check if parent has a head, we might need to append to it. 
    // Actually createMessage handles attaching to parentId if provided, but here we are appending to the *end* of the parent branch.
    // We need the head of the parent branch to be the parent of this new message.

    const parentHead = await getBranchHead(branch.parentBranchId);

    // If parent has no messages (unlikely if it's a parent), use parent's root? 
    // If parent head is null, it means its empty or verified elsewhere.

    let parentMessageId = parentHead ? parentHead.id : branch.rootMessageId;
    // Fallback to rootMessageId is risky if rootMessageId belongs to grand-parent. 
    // But if parentBranchId exists, there must be a path.

    if (!parentMessageId) {
        // Fallback if truly nothing found (shouldn't happen for valid fork)
        throw new Error("Could not find insertion point in parent branch");
    }

    await createMessage({
        content: mergeContent,
        role: "system", // System message to denote merge event
        parentId: parentMessageId,
        branchId: branch.parentBranchId,
        isHead: true,
    });

    // 5. Mark as merged
    await db.update(branches).set({ isMerged: true }).where(eq(branches.id, branchId));

    console.log(`[mergeBranch] Successfully merged ${branchId} into ${branch.parentBranchId}`);
    return branch.parentBranchId;
}
