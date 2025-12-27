"use client";

import { Message } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    GitBranch,
    ChevronLeft,
    ChevronRight,
    User,
    Bot,
    Settings,
} from "lucide-react";

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
    const isAssistant = message.role === "assistant";
    const isSystem = message.role === "system";

    const getRoleIcon = () => {
        if (isUser) return <User className="h-4 w-4" />;
        if (isAssistant) return <Bot className="h-4 w-4" />;
        return <Settings className="h-4 w-4" />;
    };

    const getRoleColor = () => {
        if (isUser) return "bg-blue-600";
        if (isAssistant) return "bg-emerald-600";
        return "bg-amber-600";
    };

    return (
        <div
            className={cn(
                "group flex gap-3 py-4 px-4 rounded-lg transition-colors",
                isUser && "bg-muted/30",
                isAssistant && "bg-background",
                isSystem && "bg-amber-500/5 border border-amber-500/20"
            )}
        >
            {/* Avatar */}
            <Avatar className={cn("h-8 w-8 shrink-0", getRoleColor())}>
                <AvatarFallback className="bg-transparent text-white">
                    {getRoleIcon()}
                </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
                {/* Role label */}
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm capitalize">
                        {message.role}
                    </span>
                    {message.isHead && (
                        <Badge variant="outline" className="text-xs py-0">
                            HEAD
                        </Badge>
                    )}
                    {isStreaming && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="animate-pulse">●</span> Streaming
                        </span>
                    )}
                </div>

                {/* Message content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>

                {/* Actions bar - visible on hover */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                    {/* Branch navigation */}
                    {siblingCount > 1 && (
                        <div className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => onNavigateSibling(message.id, "prev")}
                                            disabled={currentSiblingIndex === 0}
                                        >
                                            <ChevronLeft className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Previous branch</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <span className="text-xs font-mono px-1">
                                {currentSiblingIndex + 1}/{siblingCount}
                            </span>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => onNavigateSibling(message.id, "next")}
                                            disabled={currentSiblingIndex === siblingCount - 1}
                                        >
                                            <ChevronRight className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Next branch</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}

                    {/* Fork button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1.5 text-muted-foreground hover:text-foreground"
                                    onClick={() => onFork(message.id)}
                                >
                                    <GitBranch className="h-3.5 w-3.5" />
                                    <span className="text-xs">Fork</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Create a new branch from this message</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}
