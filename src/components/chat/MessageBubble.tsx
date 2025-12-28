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
            <div className="flex justify-end group">
                <div className="max-w-[75%]">
                    <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-3xl rounded-br-lg">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {/* Actions - visible on hover */}
                    <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {siblingCount > 1 && (
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
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
                            className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                            onClick={() => onFork(message.id)}
                        >
                            <GitBranch className="h-3.5 w-3.5 mr-1" />
                            Fork
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // AI Message
    return (
        <div className="flex gap-4 group">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800">
                <span className="text-sm font-bold text-white dark:text-black">AI</span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
                <p className="text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                    {message.content}
                    {isStreaming && (
                        <span className="inline-block w-2 h-5 ml-1 bg-black dark:bg-white animate-pulse rounded-sm" />
                    )}
                </p>
                {/* Actions */}
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {siblingCount > 1 && (
                        <div className="flex items-center gap-1 text-zinc-400 text-xs">
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
                        className="h-6 px-2 text-xs text-zinc-400 hover:text-black dark:hover:text-white"
                        onClick={() => onFork(message.id)}
                    >
                        <GitBranch className="h-3.5 w-3.5 mr-1" />
                        Fork
                    </Button>
                </div>
            </div>
        </div>
    );
}
