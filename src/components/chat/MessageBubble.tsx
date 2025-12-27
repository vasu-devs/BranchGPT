"use client";

import { Message } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
            <div className="flex justify-end">
                <div className="max-w-[80%] group">
                    <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-2xl rounded-br-md">
                        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex justify-end gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {siblingCount > 1 && (
                            <div className="flex items-center gap-1 text-zinc-400">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => onNavigateSibling(message.id, "prev")}
                                    disabled={currentSiblingIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-mono">
                                    {currentSiblingIndex + 1}/{siblingCount}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => onNavigateSibling(message.id, "next")}
                                    disabled={currentSiblingIndex === siblingCount - 1}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                                        onClick={() => onFork(message.id)}
                                    >
                                        <GitBranch className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Fork from here</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        );
    }

    // AI Message - Clean text, no background
    return (
        <div className="flex justify-start">
            <div className="max-w-[85%] group">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">AI</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                            {message.content}
                            {isStreaming && (
                                <span className="inline-block w-2 h-5 ml-1 bg-zinc-400 animate-pulse" />
                            )}
                        </p>
                        {/* Actions */}
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {siblingCount > 1 && (
                                <div className="flex items-center gap-1 text-zinc-400">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onNavigateSibling(message.id, "prev")}
                                        disabled={currentSiblingIndex === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-mono">
                                        {currentSiblingIndex + 1}/{siblingCount}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onNavigateSibling(message.id, "next")}
                                        disabled={currentSiblingIndex === siblingCount - 1}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                                            onClick={() => onFork(message.id)}
                                        >
                                            <GitBranch className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Fork from here</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
