"use client";

import { useState } from "react";
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

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

function CollapsibleTranscript({ content }: { content: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden bg-white/50 dark:bg-black/20 mt-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
                    <span>Merge Transcript</span>
                </div>
            </button>
            {isOpen && (
                <div className="p-3 pt-0 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-800/50">
                    <div className="prose prose-xs prose-zinc dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

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
                        <div className="prose prose-xs prose-invert dark:prose-neutral max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
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
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                message.role === "system"
                    ? "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
                    : "bg-zinc-900 dark:bg-white border-zinc-200 dark:border-zinc-800"
            )}>
                {message.role === "system" ? (
                    <GitBranch className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                    <span className="text-sm font-bold text-white dark:text-zinc-900">AI</span>
                )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    {message.role === "system" && message.content.includes("### Transcript:") ? (
                        <div className="flex flex-col gap-2">
                            <div className="text-amber-800 dark:text-amber-200 font-medium italic prose prose-xs prose-zinc dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:text-amber-900 dark:[&_strong]:text-amber-100">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content.split("\n\n### Transcript:\n")[0]}
                                </ReactMarkdown>
                            </div>
                            <CollapsibleTranscript content={message.content.split("\n\n### Transcript:\n")[1]} />
                        </div>
                    ) : (
                        <div className={cn(
                            "text-[15px] leading-relaxed",
                            message.role === "system" ? "text-amber-800 dark:text-amber-200 italic" : "text-foreground"
                        )}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-2 h-5 ml-1 bg-foreground animate-pulse rounded-sm" />
                            )}
                        </div>
                    )}
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


