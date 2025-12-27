"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Plus,
    MessageSquare,
    GitBranch,
    PanelLeftClose,
    PanelLeft,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Branch {
    id: string;
    name: string;
    messageCount: number;
    createdAt: Date;
    isMain?: boolean;
    parentBranchId: string | null;
}

interface SidebarProps {
    branches: Branch[];
    currentBranchId: string | null;
    onSelectBranch: (branchId: string) => void;
    onNewChat: () => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function Sidebar({
    branches,
    currentBranchId,
    onSelectBranch,
    onNewChat,
    isCollapsed = false,
    onToggleCollapse,
}: SidebarProps) {
    const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set(["main"]));
    
    // Group branches: main conversation and its child branches
    const mainBranch = branches.find((b) => b.isMain);
    const childBranches = branches.filter((b) => !b.isMain);

    const toggleExpand = (chatId: string) => {
        const newExpanded = new Set(expandedChats);
        if (newExpanded.has(chatId)) {
            newExpanded.delete(chatId);
        } else {
            newExpanded.add(chatId);
        }
        setExpandedChats(newExpanded);
    };

    if (isCollapsed) {
        return (
            <div className="w-16 h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-4 gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-10 w-10 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                    <PanelLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNewChat}
                    className="h-10 w-10 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="w-72 h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-semibold text-base tracking-tight">BranchGPT</span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                    <PanelLeftClose className="h-5 w-5" />
                </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
                <Button
                    onClick={onNewChat}
                    variant="outline"
                    className="w-full justify-start gap-3 h-11 text-base font-medium border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <Plus className="h-5 w-5" />
                    New Chat
                </Button>
            </div>

            {/* Chats List */}
            <ScrollArea className="flex-1 px-3">
                <div className="space-y-2 pb-4">
                    {/* Main Conversation with Branches */}
                    {mainBranch && (
                        <div className="space-y-1">
                            {/* Main Chat Header (Collapsible) */}
                            <div className="flex items-center">
                                <button
                                    onClick={() => toggleExpand("main")}
                                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
                                >
                                    {expandedChats.has("main") ? (
                                        <ChevronDown className="h-4 w-4 text-zinc-500" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-zinc-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => onSelectBranch(mainBranch.id)}
                                    className={cn(
                                        "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                        currentBranchId === mainBranch.id
                                            ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                    )}
                                >
                                    <MessageSquare className="h-5 w-5 shrink-0" />
                                    <span className="flex-1 text-base font-medium truncate">Main Chat</span>
                                    <span className="text-sm text-zinc-500">{mainBranch.messageCount}</span>
                                </button>
                            </div>

                            {/* Child Branches (Indented) */}
                            {expandedChats.has("main") && childBranches.length > 0 && (
                                <div className="ml-6 pl-3 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-1">
                                    {childBranches.map((branch) => (
                                        <button
                                            key={branch.id}
                                            onClick={() => onSelectBranch(branch.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                                                currentBranchId === branch.id
                                                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                                            )}
                                        >
                                            <GitBranch className="h-4 w-4 shrink-0 text-zinc-500" />
                                            <span className="flex-1 text-sm truncate">
                                                Branch #{branch.name.slice(-6)}
                                            </span>
                                            <span className="text-xs text-zinc-500">{branch.messageCount}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {branches.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                            <p className="text-base">No chats yet</p>
                            <p className="text-sm mt-1">Start a new conversation</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-500 text-center">
                    Powered by Groq
                </div>
            </div>
        </div>
    );
}
