"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Plus,
    MessageSquare,
    PanelLeftClose,
    PanelLeft,
    Trash2,
    MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    onDeleteConversation: (branchId: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function Sidebar({
    branches,
    currentBranchId,
    onSelectBranch,
    onNewChat,
    onDeleteConversation,
    isCollapsed = false,
    onToggleCollapse,
}: SidebarProps) {
    if (isCollapsed) {
        return (
            <div className="w-14 h-full bg-black border-r border-zinc-900 flex flex-col items-center py-4 gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-10 w-10 text-zinc-400 hover:text-white"
                >
                    <PanelLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNewChat}
                    className="h-10 w-10 text-zinc-400 hover:text-white"
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="w-72 h-full bg-black border-r border-zinc-900 flex flex-col">
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-900">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <div className="w-4 h-4 bg-black rounded-full" />
                    </div>
                    <span className="font-semibold text-lg text-white tracking-tight">BranchGPT</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-8 w-8 text-zinc-500 hover:text-white"
                >
                    <PanelLeftClose className="h-4 w-4" />
                </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
                <Button
                    onClick={onNewChat}
                    className="w-full justify-start gap-3 h-10 bg-white hover:bg-zinc-200 text-black font-medium border border-zinc-200"
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
                <div className="space-y-0.5">
                    <div className="px-3 py-2">
                        <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                            Recent Chats
                        </h3>
                    </div>
                    {branches.length === 0 ? (
                        <p className="text-zinc-600 text-sm px-3 py-2">No conversations yet</p>
                    ) : (
                        branches.map((branch) => (
                            <div
                                key={branch.id}
                                className="group relative flex items-center"
                            >
                                <button
                                    onClick={() => onSelectBranch(branch.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                                        currentBranchId === branch.id
                                            ? "bg-zinc-900 text-white"
                                            : "hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                                    )}
                                >
                                    <MessageSquare className="h-4 w-4 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm truncate transition-colors",
                                            currentBranchId === branch.id ? "font-medium" : "font-normal"
                                        )}>
                                            {branch.name}
                                        </p>
                                    </div>
                                </button>
                                
                                <div className={cn(
                                    "absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                                    currentBranchId === branch.id && "opacity-100"
                                )}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-zinc-800">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32 bg-black border-zinc-800 text-white">
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteConversation(branch.id);
                                                }}
                                                className="text-red-500 focus:text-red-400 focus:bg-zinc-900 cursor-pointer"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* User/Footer */}
            <div className="p-4 border-t border-zinc-900">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">User</p>
                        <p className="text-xs text-zinc-500 truncate">Free Plan</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
