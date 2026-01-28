"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/db/schema";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
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
import { BranchIcon } from "@/components/icons/BranchIcon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [forkModalOpen, setForkModalOpen] = useState(false);
    const [forkMessageId, setForkMessageId] = useState<string | null>(null);
    const [forkContent, setForkContent] = useState("");
    const [forkSourceContent, setForkSourceContent] = useState("");

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Track scroll position to decide if we should auto-scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const diff = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight);
        setIsAtBottom(diff < 50); // Threshold of 50px
    };

    // Auto-scroll on new messages or streaming
    useEffect(() => {
        if (isAtBottom || (messages.length > 0 && messages[messages.length - 1].role === "user")) {
            scrollToBottom();
        }
    }, [messages, streamingContent, isAtBottom]);

    // Initial scroll
    useEffect(() => {
        scrollToBottom("auto");
    }, []);

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
        <div className="flex flex-col h-full bg-transparent">
            {/* Scrollable Messages Area */}
            <div
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
            >
                <div className="max-w-3xl mx-auto px-6 py-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                            <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mb-8 shadow-2xl transition-transform duration-500 hover:scale-110">
                                <BranchIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 text-gradient">
                                New Conversation
                            </h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md leading-relaxed px-4">
                                Deep dive into ideas. Fork any message to explore parallel branches of thought.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    siblingCount={message.siblingCount}
                                    currentSiblingIndex={message.currentSiblingIndex}
                                    onFork={handleForkClick}
                                    onNavigateSibling={onNavigateSibling}
                                />
                            ))}

                            {/* Streaming */}
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

                            {/* Loading dots */}
                            {isLoading && !streamingContent && (
                                <div className="flex items-center gap-4 py-4 px-2">
                                    <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center shadow-lg">
                                        <span className="text-xs font-black text-slate-400">AI</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="w-2.5 h-2.5 bg-slate-400/30 rounded-full animate-bounce" />
                                        <span className="w-2.5 h-2.5 bg-slate-400/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-2.5 h-2.5 bg-slate-400/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}

                            {/* Anchor for auto-scroll */}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Input Area at Bottom */}
            <div className="bg-gradient-to-t from-background via-background/80 to-transparent pt-10 pb-2">
                <ChatInput
                    onSend={onSendMessage}
                    disabled={isLoading}
                    placeholder={isLoading ? "Thinking..." : "Type a message..."}
                />
            </div>

            {/* Fork Dialog */}
            <Dialog open={forkModalOpen} onOpenChange={setForkModalOpen}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col glass-card border-none shadow-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
                            <BranchIcon className="h-5 w-5" />
                            Create Branch
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Fork from this message to explore a different path.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
                        {forkSourceContent && (
                            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4">
                                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Original</p>
                                <div className="text-base text-zinc-700 dark:text-zinc-300 prose prose-xs prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {forkSourceContent}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-base font-medium">Your new message</label>
                            <Textarea
                                placeholder="What would you like to say instead?"
                                value={forkContent}
                                onChange={(e) => setForkContent(e.target.value)}
                                rows={3}
                                className="resize-none text-base rounded-xl border-border bg-background focus:ring-0"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setForkModalOpen(false)} className="rounded-full">
                            Cancel
                        </Button>
                        <Button onClick={handleForkSubmit} disabled={!forkContent.trim()} className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                            Create Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
