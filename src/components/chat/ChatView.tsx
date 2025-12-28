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
import { GitBranch } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    const [forkModalOpen, setForkModalOpen] = useState(false);
    const [forkMessageId, setForkMessageId] = useState<string | null>(null);
    const [forkContent, setForkContent] = useState("");
    const [forkSourceContent, setForkSourceContent] = useState("");

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamingContent]);

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
                ref={scrollRef}
                className="flex-1 overflow-y-auto no-scrollbar"
            >
                <div className="max-w-3xl mx-auto px-6 py-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 flex items-center justify-center mb-6 backdrop-blur-sm">
                                <GitBranch className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                            </div>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-3">
                                Start a conversation
                            </h2>
                            <p className="text-base text-zinc-500 max-w-md leading-relaxed">
                                Ask anything. Fork messages to explore different directions.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
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
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-zinc-500">AI</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <span className="w-2.5 h-2.5 bg-zinc-400 rounded-full animate-bounce" />
                                        <span className="w-2.5 h-2.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2.5 h-2.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}
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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
                            <GitBranch className="h-5 w-5" />
                            Create Branch
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Fork from this message to explore a different path.
                        </DialogDescription>
                    </DialogHeader>

                    {forkSourceContent && (
                        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4">
                            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-medium">Original</p>
                            <div className="text-base text-zinc-700 dark:text-zinc-300 line-clamp-3 prose prose-xs prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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
                            className="resize-none text-base"
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setForkModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleForkSubmit} disabled={!forkContent.trim()}>
                            Create Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
