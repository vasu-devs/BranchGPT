import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum for message roles
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);

// Branches table - groups messages visually and logically
export const branches = pgTable("branches", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().default("main"),
    rootMessageId: uuid("root_message_id"), // The message where this branch diverges (null for main)
    parentBranchId: uuid("parent_branch_id"), // The branch this was forked from
    isMerged: boolean("is_merged").notNull().default(false),
    userId: text("user_id").notNull().default("legacy"), // Session ID owner
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages table - the core tree structure (recursive adjacency list)
export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    role: messageRoleEnum("role").notNull(),
    parentId: uuid("parent_id"), // Self-reference to parent message (null for root)
    branchId: uuid("branch_id")
        .references(() => branches.id, { onDelete: "cascade" })
        .notNull(),
    isHead: boolean("is_head").notNull().default(false), // Marks the tip of a branch
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for Drizzle
export const branchesRelations = relations(branches, ({ many, one }) => ({
    messages: many(messages),
    parentBranch: one(branches, {
        fields: [branches.parentBranchId],
        references: [branches.id],
        relationName: "parentBranch",
    }),
    childBranches: many(branches, { relationName: "parentBranch" }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
    parent: one(messages, {
        fields: [messages.parentId],
        references: [messages.id],
        relationName: "parentChild",
    }),
    children: many(messages, { relationName: "parentChild" }),
    branch: one(branches, {
        fields: [messages.branchId],
        references: [branches.id],
    }),
}));

// Type exports for TypeScript
export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MessageRole = "user" | "assistant" | "system";
