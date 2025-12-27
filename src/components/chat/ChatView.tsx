"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/db/schema";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { GitBranch } from "lucide-react";

interface MessageWithMeta extends Message {
    siblingCount: number;
    currentSiblingIndex: number;
}

interface ChatViewProps {
    messages: MessageWithMeta[];
    branchName: string;
    onSendMessage: (content: string) => void;
    onFork: (messageId: string, content: string) => void;
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
    const [forkModalOpen, setForkModalOpen] = useState(false);
    const [forkMessageId, setForkMessageId] = useState<string | null>(null);
    const [forkContent, setForkContent] = useState("");
    const [forkSourceContent, setForkSourceContent] = useState("");

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamingContent, autoScroll]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const isAtBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight < 100;
        setAutoScroll(isAtBottom);
    };

    const handleForkClick = (messageId: string) => {
        const message = messages.find((m) => m.id === messageId);
        if (message) {
            setForkSourceContent(message.content);
        }
        setForkMessageId(messageId);
        setForkContent("");
        setForkModalOpen(true);
    };

    const handleForkSubmit = () => {
        if (forkMessageId && forkContent.trim()) {
            onFork(forkMessageId, forkContent.trim());
            setForkModalOpen(false);
            setForkMessageId(null);
            setForkContent("");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            {/* Messages */}
            <ScrollArea
                ref={scrollRef}
                className="flex-1"
                onScroll={handleScroll}
            >
                <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-8">
                                <GitBranch className="h-8 w-8 text-zinc-400" />
                            </div>
                            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                                How can I help you today?
                            </h2>
                            <p className="text-base text-zinc-500 max-w-md leading-relaxed">
                                Start a conversation. Fork any message to explore different directions.
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className="message-enter">
                                <MessageBubble
                                    message={message}
                                    siblingCount={message.siblingCount}
                                    currentSiblingIndex={message.currentSiblingIndex}
                                    onFork={handleForkClick}
                                    onNavigateSibling={onNavigateSibling}
                                />
                            </div>
                        ))
                    )}

                    {/* Streaming */}
                    {streamingContent && (
                        <div className="message-enter">
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
                                onFork={() => {}}
                                onNavigateSibling={() => {}}
                                isStreaming
                            />
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && !streamingContent && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">AI</span>
                                </div>
                                <div className="flex gap-1.5 py-3">
                                    <span className="w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <ChatInput
                onSend={onSendMessage}
                disabled={isLoading}
                placeholder={isLoading ? "Thinking..." : "Message BranchGPT..."}
            />

            {/* Fork Dialog */}
            <Dialog open={forkModalOpen} onOpenChange={setForkModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                            <GitBranch className="h-5 w-5" />
                            Create Branch
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Fork from this point to explore an alternative path.
                        </DialogDescription>
                    </DialogHeader>

                    {forkSourceContent && (
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">From</p>
                            <p className="text-base text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                                {forkSourceContent}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-base font-medium">Your message</label>
                        <Textarea
                            placeholder="What would you like to explore instead?"
                            value={forkContent}
                            onChange={(e) => setForkContent(e.target.value)}
                            rows={3}
                            className="resize-none text-base"
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setForkModalOpen(false)} className="text-base">
                            Cancel
                        </Button>
                        <Button onClick={handleForkSubmit} disabled={!forkContent.trim()} className="text-base">
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
