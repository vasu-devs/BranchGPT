"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({
    onSend,
    disabled = false,
    placeholder = "Message BranchGPT...",
}: ChatInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
            handleSubmit(e);
        }
    };

    return (
        <div className="p-6">
            <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
                <div className="relative border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg bg-white dark:bg-zinc-900">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className="w-full resize-none bg-transparent pl-5 pr-14 py-4 text-base placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ maxHeight: "200px" }}
                    />
                    <Button
                        type="submit"
                        disabled={disabled || !input.trim()}
                        size="icon"
                        className="absolute right-3 bottom-3 h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-30"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
