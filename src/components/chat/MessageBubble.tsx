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
                    <div className="prose prose-xs prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
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
                    <div className="bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 px-6 py-4 rounded-[2rem] rounded-br-[0.5rem] shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-white dark:to-slate-100 border border-white/10 dark:border-black/5">
                        <div className="prose prose-sm prose-invert dark:prose-neutral max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed font-sans">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                    {/* Actions - visible on hover or always on mobile */}
                    <div className="flex justify-end gap-2 mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        {siblingCount > 1 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-black/5 text-slate-500 text-[10px] font-mono">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-white/10 dark:hover:bg-black/10 rounded-full"
                                    onClick={() => onNavigateSibling(message.id, "prev")}
                                    disabled={currentSiblingIndex === 0}
                                >
                                    <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <span className="font-bold">{currentSiblingIndex + 1}/{siblingCount}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-white/10 dark:hover:bg-black/10 rounded-full"
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
                            asChild
                            className="h-8 px-4 rounded-full text-xs font-semibold bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-black/5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-black/10 transition-all shadow-sm"
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
                            className="h-8 px-4 rounded-full text-xs font-semibold bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-black/5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-black/10 transition-all shadow-sm"
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
    }

    // AI Message
    return (
        <motion.div
            variants={entryVariants}
            initial="hidden"
            animate="visible"
            layout
            className="flex gap-4 group py-4"
        >
            {/* Avatar */}
            <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border glass shadow-lg transition-transform duration-300 group-hover:scale-110",
                message.role === "system"
                    ? "bg-amber-100/30 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/50"
                    : "bg-white dark:bg-slate-900 border-white/20 dark:border-white/5"
            )}>
                {message.role === "system" ? (
                    <GitBranch className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-slate-400 blur-md opacity-20 animate-pulse" />
                        <span className="relative text-xs font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase">AI</span>
                    </div>
                )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    {message.role === "system" && message.content.includes("### Transcript:") ? (
                        <div className="flex flex-col gap-3">
                            <div className="glass-card p-5 text-amber-900/80 dark:text-amber-100/80 font-medium italic border-amber-200/30 dark:border-amber-800/30">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content.split("\n\n### Transcript:\n")[0]}
                                </ReactMarkdown>
                            </div>
                            <CollapsibleTranscript content={message.content.split("\n\n### Transcript:\n")[1]} />
                        </div>
                    ) : (
                        <div className={cn(
                            "text-base leading-relaxed p-1 font-sans",
                            message.role === "system" ? "text-amber-800/90 dark:text-amber-200/90 italic font-medium glass-card p-6 border-amber-500/10" : "text-slate-700 dark:text-slate-300"
                        )}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-2 h-5 ml-1 bg-slate-400/50 animate-pulse rounded-full align-middle" />
                            )}
                        </div>
                    )}
                </div>
            </div>
             {/* Actions on hover for AI */}
             <div className="flex justify-start gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 px-4 rounded-full text-xs font-semibold bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-black/5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-black/10 shadow-sm"
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
                    className="h-8 px-4 rounded-full text-xs font-semibold bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-black/5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-black/10 shadow-sm"
                    onClick={() => onFork(message.id)}
                >
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <GitBranch className="h-3.5 w-3.5 mr-2" />
                        Fork
                    </motion.button>
                </Button>
             </div>
        </motion.div>
    );
});


