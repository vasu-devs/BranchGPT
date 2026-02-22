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
                <div className="max-w-5xl mx-auto px-6 py-8">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center min-h-[75vh] text-center max-w-5xl mx-auto px-4"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-[40%] bg-amber-100/50  backdrop-blur-md flex items-center justify-center mb-3 sm:mb-3 shadow-[0_0_40px_rgba(245,158,11,0.2)] border border-amber-500/30"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600  sm:w-10 sm:h-10">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z" fill="currentColor" fillOpacity="0.2" />
                                    <path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2V22Z" fill="currentColor" />
                                </svg>
                            </motion.div>

                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-foreground mb-2 sm:mb-4 pb-1 font-serif">
                                Plant a Seed.
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-4 sm:mb-6 font-medium px-4">
                                Human intelligence isn't linear. It forks, roots, and flourishes.
                                <span className="block mt-1 sm:mt-2 text-foreground/80 font-bold tracking-wide">Grow your ideas organically.</span>
                            </p>

                            <div className="w-full mb-6 sm:mb-8 -mt-2">
                                <HeroAnimation />
                            </div>

                            <div className="w-full max-w-2xl relative z-10 mb-8 mt-4">
                                <ChatInput
                                    onSend={onSendMessage}
                                    disabled={isLoading}
                                    placeholder="Plant your first seed of thought..."
                                />
                            </div>

                            <div className="flex flex-col items-center gap-5 w-full">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700/60 ">Or cultivate these paths</p>
                                <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl px-4">
                                    {[
                                        { title: "Quantum Entanglement", icon: "✨" },
                                        { title: "Socrates vs Descartes", icon: "🏛️" },
                                        { title: "Build a Next.js App", icon: "⚛️" },
                                        { title: "Poem about a quiet forest", icon: "🌲" }
                                    ].map((starter, i) => (
                                        <motion.button
                                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.15 + 0.8, type: "spring" } }}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            key={starter.title}
                                            onClick={() => onSendMessage(starter.title)}
                                            className="px-5 py-3 rounded-[2rem] text-sm font-semibold flex items-center gap-3 bg-white/80  backdrop-blur-md border border-border/80 hover:border-amber-500/50 text-foreground hover:bg-amber-50 :bg-amber-900/20 hover:text-amber-700 :text-amber-400 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.15)]"
                                        >
                                            <span className="text-lg">{starter.icon}</span>
                                            {starter.title}
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
                        className="shrink-0 p-4 border-t border-white/5 bg-background/80 backdrop-blur-xl relative z-20"
                    >
                        <div className="max-w-5xl mx-auto w-full relative">
                            <ChatInput
                                onSend={onSendMessage}
                                disabled={isLoading}
                                placeholder={isLoading ? "Thinking..." : "Continue the branch..."}
                            />
                        </div>
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

                    <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col pt-4 overflow-y-auto min-h-0 relative z-10 scroll-smooth">
                        {forkSourceContent && (
                            <div className="rounded-xl bg-zinc-100/50  p-4 border border-border/50">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Source Context</p>
                                <div className="text-sm text-foreground/80 prose prose-xs prose-neutral  max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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
                        <Button variant="outline" onClick={() => setForkModalOpen(false)} className="rounded-xl border-border hover:bg-secondary btn-3d bg-white ">
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
