"use client";

import React, { useState } from "react";
import { Message } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GitBranch, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, Variants, AnimatePresence } from "framer-motion";

interface MessageBubbleProps {
    message: Message;
    siblingCount: number;
    currentSiblingIndex: number;
    onFork: (messageId: string) => void;
    onNavigateSibling: (messageId: string, direction: "prev" | "next") => void;
    isStreaming?: boolean;
}

function CollapsibleTranscript({ content }: { content: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="tech-border rounded-none overflow-hidden bg-secondary/10 mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <ChevronRight className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")} />
                    <span>Merge_Transcript.log</span>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-[12px] font-mono text-muted-foreground bg-secondary/5 border-t border-border/40">
                    <div className="prose prose-xs prose-neutral  max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

const entryVariants: Variants = {
    hidden: { opacity: 0, y: 15, filter: "blur(8px)", scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

export const MessageBubble = React.memo(function MessageBubble({
    message,
    siblingCount,
    currentSiblingIndex,
    onFork,
    onNavigateSibling,
    isStreaming = false,
}: MessageBubbleProps) {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isUser) {
        return (
            <motion.div
                variants={entryVariants}
                initial="hidden"
                animate="visible"
                layout
                className="flex justify-end group py-3"
            >
                <div className="max-w-[85%]">
                    <div className="matte bg-amber-100/40  px-5 py-4 rounded-tl-[1.8rem] rounded-br-[1.8rem] rounded-tr-sm rounded-bl-sm relative overflow-hidden shadow-sm border border-amber-500/10">
                        <div className="prose  max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed font-sans relative z-10">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                    {/* Actions - visible on hover or always on mobile */}
                    <div className="flex justify-end gap-2 mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        {siblingCount > 1 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5  backdrop-blur-md border border-white/10  text-slate-500 text-[10px] font-mono">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-white/10 :bg-black/10 rounded-full"
                                    onClick={() => onNavigateSibling(message.id, "prev")}
                                    disabled={currentSiblingIndex === 0}
                                >
                                    <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <span className="font-bold">{currentSiblingIndex + 1}/{siblingCount}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-white/10 :bg-black/10 rounded-full"
                                    onClick={() => onNavigateSibling(message.id, "next")}
                                    disabled={currentSiblingIndex === siblingCount - 1}
                                >
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-4 rounded-full text-xs font-semibold btn-3d bg-white  text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all shadow-sm"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-3.5 w-3.5 mr-2" /> : <Copy className="h-3.5 w-3.5 mr-2" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-4 rounded-full text-xs font-semibold btn-3d bg-white  text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all shadow-sm"
                            onClick={() => onFork(message.id)}
                        >
                            <GitBranch className="h-3.5 w-3.5 mr-2" />
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
            variants={entryVariants}
            initial="hidden"
            animate="visible"
            layout={!isStreaming}
            className={cn("flex gap-4 group py-4", isStreaming && "animate-none")}
        >
            {/* Avatar */}
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-all duration-300",
                message.role === "system"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                    : "bg-background border-border/60"
            )}>
                {message.role === "system" ? (
                    <GitBranch className="h-6 w-6" />
                ) : (
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary blur-xl opacity-20 animate-pulse" />
                        <span className="relative text-[10px] font-black tracking-widest uppercase">AI</span>
                    </div>
                )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
                <div className="prose max-w-none">
                    {message.role === "system" && message.content.includes("### Transcript:") ? (
                        <div className="flex flex-col gap-4">
                            <div className="glass-card p-6 text-amber-900/80  font-medium italic border-amber-500/20 shadow-xl">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content.split("\n\n### Transcript:\n")[0]}
                                </ReactMarkdown>
                            </div>
                            <CollapsibleTranscript content={message.content.split("\n\n### Transcript:\n")[1]} />
                        </div>
                    ) : (
                        <div className={cn(
                            "text-base leading-relaxed p-5 rounded-tr-[1.8rem] rounded-bl-[1.8rem] rounded-tl-sm rounded-br-sm glass-card transition-all duration-300 bg-white/60  shadow-sm border border-border/60",
                            message.role === "system" ? "text-amber-800/90  italic font-medium border-amber-500/20" : "",
                            isStreaming && "transition-none shadow-none"
                        )}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-1.5 h-5 ml-1 bg-primary/60 animate-pulse rounded-sm align-middle" />
                            )}
                        </div>
                    )}
                </div>
                {/* Actions on hover for AI */}
                <div className="flex justify-start gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 px-4 rounded-full text-xs font-semibold bg-white/5  backdrop-blur-md border border-white/10  text-slate-500 hover:text-slate-900 :text-slate-100 hover:bg-white/10 :bg-black/10 shadow-sm"
                        onClick={handleCopy}
                    >
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {copied ? <Check className="h-3.5 w-3.5 mr-2" /> : <Copy className="h-3.5 w-3.5 mr-2" />}
                            {copied ? "Copied" : "Copy"}
                        </motion.button>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 px-4 rounded-full text-xs font-semibold bg-white/5  backdrop-blur-md border border-white/10  text-slate-500 hover:text-slate-900 :text-slate-100 hover:bg-white/10 :bg-black/10 shadow-sm"
                        onClick={() => onFork(message.id)}
                    >
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <GitBranch className="h-3.5 w-3.5 mr-2" />
                            Fork
                        </motion.button>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
});


