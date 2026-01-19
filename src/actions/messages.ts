"use server";

import { db, messages, branches, type Message, type NewMessage, type NewBranch } from "@/db";
import { eq, and, isNull, sql, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { cookies } from "next/headers";

/**
 * Utility to manage user sessions via cookies.
 */
async function ensureAuth() {
    try {
        const cookieStore = await cookies();
        let userId = (await cookieStore).get("branchgpt-userid")?.value;

        if (!userId) {
            userId = uuidv4();
            try {
                (await cookieStore).set("branchgpt-userid", userId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 60 * 60 * 24 * 365, // 1 year
                });
            } catch (e) {
                // Next.js sometimes errors if cookies are set after headers - fallback safely
            }
        }
        return userId || "legacy";
    } catch (e) {
        return "legacy";
    }
}

/**
 * Recursively fetches the conversation history from a node back to root.
 * Returns messages in chronological order [Root -> ... -> Node]
 */
export async function getConversationHistory(nodeId: string): Promise<Message[]> {
    // Optimized: Use Recursive CTE to fetch entire lineage in one query
    const result = await db.execute(sql`
        WITH RECURSIVE chain AS (
            SELECT *
            FROM messages
            WHERE id = ${nodeId}
            
            UNION ALL
            
            SELECT m.*
            FROM messages m
            INNER JOIN chain c ON m.id = c.parent_id
        )
        SELECT * FROM chain ORDER BY created_at ASC;
    `);

    // Map raw query results (snake_case) to application type (camelCase)
    // Drizzle's execute returns raw row data via .rows property
    return result.rows.map((row: any) => ({
        id: row.id,
        content: row.content,
        role: row.role,
        parentId: row.parent_id,
        branchId: row.branch_id,
        isHead: row.is_head,
        createdAt: new Date(row.created_at),
    }));
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

    const userId = await ensureAuth();

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

    const userId = await ensureAuth();

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
    const userId = await ensureAuth();

    return db.query.branches.findMany({
        where: and(isNull(branches.parentBranchId), eq(branches.userId, userId)),
        orderBy: (branches, { desc }) => [desc(branches.createdAt)],
    });
}

/**
 * Optimized fetch for sidebar: Gets conversations + message counts in ONE query.
 */
export async function getConversationsWithCounts() {
    const userId = await ensureAuth();

    // We need to import 'count' and 'sql' from drizzle-orm if not available, 
    // but we can use db.execute or query builder.
    // Let's use the query builder with sql count.

    const result = await db.select({
        id: branches.id,
        name: branches.name,
        createdAt: branches.createdAt,
        messageCount: sql<number>`count(${messages.id})`.mapWith(Number),
        parentBranchId: branches.parentBranchId,
        rootMessageId: branches.rootMessageId,
        isMerged: branches.isMerged,
    })
        .from(branches)
        .leftJoin(messages, eq(branches.id, messages.branchId))
        .where(and(isNull(branches.parentBranchId), eq(branches.userId, userId)))
        .groupBy(branches.id, branches.name, branches.createdAt, branches.parentBranchId, branches.rootMessageId, branches.isMerged)
        .orderBy(desc(branches.createdAt));

    return result as {
        id: string;
        name: string;
        createdAt: Date;
        messageCount: number;
        parentBranchId: string | null;
        rootMessageId: string | null;
        isMerged: boolean | null
    }[];
}

/**
 * Get all branches belonging to a specific conversation tree
 */
export async function getBranchTree(rootBranchId: string) {
    // We already have optimized CTE for history, but for tree we can just fetch all branches
    // for now and filter. However, to make it faster, we can fetch only branches for this user.
    const userId = await ensureAuth();

    return db.query.branches.findMany({
        where: eq(branches.userId, userId),
        orderBy: (branches, { asc }) => [asc(branches.createdAt)],
    });
}

/**
 * Optimized fetch for a conversation tree: 
 * Gets all branches and their basic info in one query.
 * We can't easily get counts and head message in ONE query without a complex join or subqueries,
 * but we can fetch them separately and combine.
 */
export async function getBranchTreeDetailed(rootBranchId: string) {
    const userId = await ensureAuth();

    // 1. Get all branches for this user/tree
    // In a real app we'd filter by connectivity to rootBranchId via CTE
    const allBranches = await db.query.branches.findMany({
        where: eq(branches.userId, userId),
        orderBy: (branches, { asc }) => [asc(branches.createdAt)],
    });

    // 2. Identify branches in this specific tree (descendants of rootBranchId)
    const treeBranchIds = new Set<string>([rootBranchId]);
    let added = true;
    while (added) {
        added = false;
        for (const b of allBranches) {
            if (!treeBranchIds.has(b.id) && b.parentBranchId && treeBranchIds.has(b.parentBranchId)) {
                treeBranchIds.add(b.id);
                added = true;
            }
        }
    }

    const filteredBranches = allBranches.filter(b => treeBranchIds.has(b.id));

    // 3. Get message counts and head info for these branches
    // We can join with messages to get counts
    const branchStats = await db.select({
        id: branches.id,
        messageCount: sql<number>`count(${messages.id})`.mapWith(Number),
    })
        .from(branches)
        .leftJoin(messages, eq(branches.id, messages.branchId))
        .where(sql`${branches.id} IN ${filteredBranches.map(b => b.id)}`)
        .groupBy(branches.id);

    const statsMap = new Map(branchStats.map(s => [s.id, s.messageCount]));

    return filteredBranches.map(b => ({
        ...b,
        messageCount: statsMap.get(b.id) || 0,
        isMain: b.id === rootBranchId,
    }));
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

    // Filter history to only include messages that belong to this branch
    // The branch.rootMessageId is the message we forked FROM (belonging to parent).
    // So we want everything *after* rootMessageId.
    // However, if the branch is a root branch (no parent), we take everything.

    let filteredHistory = history;
    if (branch.rootMessageId) {
        const rootIndex = history.findIndex(m => m.id === branch.rootMessageId);
        if (rootIndex !== -1) {
            // slice(rootIndex + 1) takes everything AFTER the root message
            filteredHistory = history.slice(rootIndex + 1);
        }
    }

    return { history: filteredHistory, branchName: branch.name };
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
        // Production: Sanitize and limit input length for LLM safety
        const safeContent = content.slice(0, 500); 

        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: "You are a helpful assistant. Generate a concise (3-5 words) title for a conversation branch starting with the following user message. Do not use quotes.",
            prompt: safeContent,
        });
        return text.trim();
    } catch (error) {
        // Use a more silent error handling for production
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

    // 3. Generate Summary using LLM
    // Limit transcript size for performance and cost control
    const transcript = history
        .slice(-20) // Only take last 20 messages for summary if too long
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content.slice(0, 1000)}`)
        .join("\n\n");

    let summary = "";
    try {
        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: `You are an expert technical project manager and software architect. 
Your task is to summarize the key developments from a conversation branch that is being merged back into the main project.
Focus on:
- Key decisions made
- Code changes or features implemented
- Important conclusions reached
- Any outstanding tasks or notes

Format the output as a concise markdown summary. Do not use conversational filler. Start directly with the summary.`,
            prompt: `Branch Name: ${branchName}\n\nConversation Transcript:\n${transcript}`,
        });
        summary = text;
    } catch (error) {
        summary = `Merged branch "**${branchName}**". (Summary generation failed)`;
    }

    const mergeContent = `### 🔀 Merged Branch: ${branchName}\n\n${summary}`;

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

    return branch.parentBranchId;
}
