"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({
    onSend,
    disabled = false,
    placeholder = "Type a message...",
}: ChatInputProps) {
    const [input, setInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [input]);

    // Auto-focus when re-enabled (after AI finishes)
    useEffect(() => {
        if (!disabled && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [disabled]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || disabled) return;
        onSend(input.trim());
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6">
            <motion.div 
                animate={{ 
                    scale: isFocused ? 1.01 : 1,
                    boxShadow: isFocused ? "0 20px 40px rgba(0,0,0,0.12)" : "0 10px 30px rgba(0,0,0,0.06)"
                }}
                className={cn(
                    "relative flex items-end gap-3 glass-card p-3 transition-all duration-300",
                    isFocused ? "border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-black/90" : "bg-white/70 dark:bg-black/70"
                )}
            >
                <div className="relative flex-1 flex flex-col">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className="flex-1 resize-none bg-transparent px-4 py-4 text-base placeholder:text-muted-foreground/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[56px] leading-relaxed font-sans"
                        style={{ maxHeight: "150px" }}
                    />
                    <AnimatePresence>
                        {input.length > 0 && isFocused && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                className="absolute right-2 bottom-4 pointer-events-none"
                            >
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                    <Command className="h-2.5 w-2.5" />
                                    <span>Enter</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={disabled || !input.trim()}
                    size="icon"
                    asChild
                    className="h-14 w-14 shrink-0 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 glossy-button"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Send className="h-6 w-6" />
                    </motion.button>
                </Button>
            </motion.div>
            <div className="mt-6 flex justify-center py-2">
                <motion.a
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://vasudev.live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex items-center gap-2 px-5 py-2 rounded-full border border-slate-200/30 dark:border-slate-800/30 bg-white/5 dark:bg-black/5 backdrop-blur-md"
                >
                    <span className="opacity-60">Handcrafted by</span>
                    <span className="tracking-tight text-slate-900 dark:text-slate-100 font-bold">Vasu-DevS</span>
                </motion.a>
            </div>
        </div>
    );
}
