"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

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
        <div className="max-w-3xl mx-auto px-4">
            <div className="relative flex items-end gap-2 glass-panel rounded-2xl p-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-4 py-3 text-[15px] placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px]"
                    style={{ maxHeight: "150px" }}
                />
                <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={disabled || !input.trim()}
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-xl bg-foreground text-background hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-all"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
            <div className="mt-4 flex justify-center py-2">
                <a
                    href="https://vasudev.live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-zinc-400 hover:text-foreground transition-all flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100/30 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm shadow-sm"
                >
                    <span className="opacity-70">Made with ❤️ by</span>
                    <span className="tracking-tight text-zinc-900 dark:text-zinc-100 font-bold">Vasu-DevS</span>
                </a>
            </div>
        </div>
    );
}
