"use client";

import { Message } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GitBranch, ChevronLeft, ChevronRight } from "lucide-react";

interface MessageBubbleProps {
    message: Message;
    siblingCount: number;
    currentSiblingIndex: number;
    onFork: (messageId: string) => void;
    onNavigateSibling: (messageId: string, direction: "prev" | "next") => void;
    isStreaming?: boolean;
}

import { motion } from "framer-motion";

export function MessageBubble({
    message,
    siblingCount,
    currentSiblingIndex,
    onFork,
    onNavigateSibling,
    isStreaming = false,
}: MessageBubbleProps) {
    const isUser = message.role === "user";

    if (isUser) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex justify-end group py-2"
            >
                <div className="max-w-[75%]">
                    <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-3xl rounded-br-sm shadow-md bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-200">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {/* Actions - visible on hover */}
                    <div className="flex justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {siblingCount > 1 && (
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => onNavigateSibling(message.id, "prev")}
                                    disabled={currentSiblingIndex === 0}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <span className="font-mono">{currentSiblingIndex + 1}/{siblingCount}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => onNavigateSibling(message.id, "next")}
                                    disabled={currentSiblingIndex === siblingCount - 1}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => onFork(message.id)}
                        >
                            <GitBranch className="h-3.5 w-3.5 mr-1" />
                            Fork
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // AI Message
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex gap-4 group py-2"
        >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <span className="text-sm font-bold text-white dark:text-zinc-900">AI</span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
                        {message.content}
                        {isStreaming && (
                            <span className="inline-block w-2 h-5 ml-1 bg-foreground animate-pulse rounded-sm" />
                        )}
                    </p>
                </div>
                {/* Actions */}
                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {siblingCount > 1 && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onNavigateSibling(message.id, "prev")}
                                disabled={currentSiblingIndex === 0}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="font-mono">{currentSiblingIndex + 1}/{siblingCount}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => onNavigateSibling(message.id, "next")}
                                disabled={currentSiblingIndex === siblingCount - 1}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => onFork(message.id)}
                    >
                        <GitBranch className="h-3.5 w-3.5 mr-1" />
                        Fork
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
