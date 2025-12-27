"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || disabled) return;
        onSend(input.trim());
        setInput("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-background">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1"
                autoFocus
            />
            <Button type="submit" disabled={disabled || !input.trim()} size="icon">
                {disabled ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
            </Button>
        </form>
    );
}
