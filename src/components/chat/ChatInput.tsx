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
        <div className="max-w-3xl mx-auto p-4">
            <div className="relative flex items-end gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-2">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-4 py-3 text-[15px] placeholder:text-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px]"
                    style={{ maxHeight: "150px" }}
                />
                <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={disabled || !input.trim()}
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-xl bg-black hover:bg-zinc-800 text-white disabled:opacity-40 disabled:bg-zinc-400 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
            <p className="text-center text-xs text-zinc-500 mt-2">
                Press Enter to send, Shift+Enter for new line
            </p>
        </div>
    );
}
