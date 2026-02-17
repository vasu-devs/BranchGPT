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

    const handleSend = () => {
        handleSubmit();
    };

    return (
        <div className="max-w-4xl mx-auto px-6">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    boxShadow: isFocused ? "0 4px 20px var(--matte-shadow)" : "0 2px 10px var(--matte-shadow)"
                }}
                className={cn(
                    "relative flex items-end gap-3 matte p-3 transition-all duration-300 rounded-2xl",
                    isFocused ? "border-primary/20 bg-background" : "bg-background/90"
                )}
            >
                <div className="flex-1 relative min-h-[44px] flex items-center">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        rows={1}
                        disabled={disabled}
                        className="w-full bg-transparent border-none focus:ring-0 resize-none py-2.5 px-4 text-base placeholder:text-muted-foreground/60 transition-all text-foreground font-sans scroll-smooth relative z-10"
                    />
                    <AnimatePresence>
                        {input.length > 0 && isFocused && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                className="absolute right-2 bottom-4 pointer-events-none z-20"
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
                    className="h-11 w-11 shrink-0 rounded-xl btn-3d-primary shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 z-10"
                >
                    <Send className="h-5 w-5" />
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
