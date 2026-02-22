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

import { HeroAnimation } from "@/components/home/HeroAnimation";

export interface MessageWithMeta extends Message {
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
                className="flex-1 overflow-y-auto technical-scroll scroll-smooth"
            >
                <div className="max-w-3xl mx-auto px-6 py-8">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center min-h-[75vh] text-center max-w-3xl mx-auto"
                        >
                            <div className="w-20 h-20 rounded-3xl matte flex items-center justify-center mb-6 shadow-xl border border-border/60 transition-transform duration-500 hover:rotate-6 bg-gradient-to-br from-background to-secondary/20">
                                <BranchIcon className="h-10 w-10 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 mb-4 pb-1">
                                BranchGPT
                            </h2>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-6 font-medium">
                                Human intelligence isn't a straight line. It forks, branches, and explores alternatives.
                                <span className="block mt-2 text-foreground/80 font-semibold">Your AI should too.</span>
                            </p>

                            <div className="w-full mb-10 -mt-4">
                                <HeroAnimation />
                            </div>

                            <div className="w-full max-w-2xl mb-12 relative z-10">
                                <ChatInput
                                    onSend={onSendMessage}
                                    disabled={isLoading}
                                    placeholder="Start your first branch of thought..."
                                />
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Try exploring these paths</p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {[
                                        "Explain quantum entanglement",
                                        "How to build a SaaS in 2026?",
                                        "Why is rust becoming so popular?",
                                        "Write a poem about time travel"
                                    ].map((starter, i) => (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 + 0.5 } }}
                                            key={starter}
                                            onClick={() => onSendMessage(starter)}
                                            className="px-5 py-2.5 rounded-2xl text-sm font-medium btn-3d bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border hover:border-primary/30 text-foreground hover:bg-secondary/80 transition-all duration-300 shadow-sm"
                                        >
                                            {starter}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <LayoutGroup>
                            <div className="space-y-8">
                                <AnimatePresence mode="popLayout">
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
                                </AnimatePresence>

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
                                        <div className="w-10 h-10 rounded-2xl matte flex items-center justify-center shadow-sm border border-border">
                                            <span className="text-xs font-black text-foreground">AI</span>
                                        </div>
                                        <div className="flex gap-1.5 items-center">
                                            <motion.span
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                                                className="w-2 h-2 bg-primary/40 rounded-full"
                                            />
                                            <motion.span
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                                                className="w-2 h-2 bg-primary/40 rounded-full"
                                            />
                                            <motion.span
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
                                                className="w-2 h-2 bg-primary/40 rounded-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Anchor for auto-scroll */}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        </LayoutGroup>
                    )}
                </div>
            </div>

            {/* Fixed Input Area at Bottom - only show when there are messages */}
            <AnimatePresence>
                {messages.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="bg-gradient-to-t from-background via-background/80 to-transparent pt-10 pb-2"
                    >
                        <ChatInput
                            onSend={onSendMessage}
                            disabled={isLoading}
                            placeholder={isLoading ? "Thinking..." : "Continue the branch..."}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fork Dialog */}
            <Dialog open={forkModalOpen} onOpenChange={setForkModalOpen}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col glass-card border border-border shadow-2xl rounded-2xl p-0 overflow-hidden">
                    <div className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-foreground">
                            <div className="w-8 h-8 rounded-lg matte flex items-center justify-center border border-border">
                                <BranchIcon className="h-4 w-4" />
                            </div>
                            Create Branch
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            Fork from this message to explore a different path.
                        </DialogDescription>
                    </div>

                    <div className="flex-1 overflow-y-auto technical-scroll min-h-0 space-y-6 px-6 py-2">
                        {forkSourceContent && (
                            <div className="rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 p-4 border border-border/50">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Source Context</p>
                                <div className="text-sm text-foreground/80 prose prose-xs prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {forkSourceContent}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-foreground/90">Your new direction</label>
                            <Textarea
                                placeholder="What would you like to say instead?"
                                value={forkContent}
                                onChange={(e) => setForkContent(e.target.value)}
                                rows={3}
                                className="resize-none text-base rounded-xl border-border bg-background focus:ring-0 shadow-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 border-t border-border/40">
                        <Button variant="outline" onClick={() => setForkModalOpen(false)} className="rounded-xl border-border hover:bg-secondary btn-3d bg-white dark:bg-zinc-900">
                            Cancel
                        </Button>
                        <Button onClick={handleForkSubmit} disabled={!forkContent.trim()} className="rounded-xl btn-3d-primary font-medium">
                            Create Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
