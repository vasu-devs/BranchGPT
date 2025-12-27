"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/db/schema";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { GitBranch } from "lucide-react";

interface MessageWithMeta extends Message {
    siblingCount: number;
    currentSiblingIndex: number;
}

interface ChatViewProps {
    messages: MessageWithMeta[];
    branchName: string;
    onSendMessage: (content: string) => void;
    onFork: (messageId: string) => void;
    onNavigateSibling: (messageId: string, direction: "prev" | "next") => void;
    isLoading?: boolean;
    streamingContent?: string;
}

export function ChatView({
    messages,
    branchName,
    onSendMessage,
    onFork,
    onNavigateSibling,
    isLoading = false,
    streamingContent,
}: ChatViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamingContent, autoScroll]);

    // Detect if user scrolls up
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const isAtBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight < 100;
        setAutoScroll(isAtBottom);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{branchName}</span>
                <Badge variant="secondary" className="text-xs">
                    {messages.length} messages
                </Badge>
            </div>

            {/* Messages */}
            <ScrollArea
                ref={scrollRef}
                className="flex-1 px-2"
                onScroll={handleScroll}
            >
                <div className="max-w-3xl mx-auto py-4 space-y-1">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <GitBranch className="h-12 w-12 text-muted-foreground/40 mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground">
                                Start a conversation
                            </h3>
                            <p className="text-sm text-muted-foreground/60 max-w-sm mt-1">
                                Type a message below. You can fork any message to create
                                branching conversations, just like Git.
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                siblingCount={message.siblingCount}
                                currentSiblingIndex={message.currentSiblingIndex}
                                onFork={onFork}
                                onNavigateSibling={onNavigateSibling}
                            />
                        ))
                    )}

                    {/* Streaming message */}
                    {streamingContent && (
                        <MessageBubble
                            message={{
                                id: "streaming",
                                content: streamingContent,
                                role: "assistant",
                                parentId: null,
                                branchId: "",
                                isHead: true,
                                createdAt: new Date(),
                            }}
                            siblingCount={1}
                            currentSiblingIndex={0}
                            onFork={() => { }}
                            onNavigateSibling={() => { }}
                            isStreaming
                        />
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="max-w-3xl mx-auto w-full">
                <ChatInput
                    onSend={onSendMessage}
                    disabled={isLoading}
                    placeholder={
                        isLoading ? "AI is thinking..." : "Type a message to continue..."
                    }
                />
            </div>
        </div>
    );
}
