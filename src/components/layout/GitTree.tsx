"use client";

import { Button } from "@/components/ui/button";
import { GitBranch, GitCommit, PanelRightClose, PanelRight, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GitTreeProps {
    branches: {
        id: string;
        name: string;
        parentBranchId: string | null;
        rootMessageId: string | null;
        messageCount?: number;
    }[];
    currentBranchId: string | null;
    onSelectBranch: (branchId: string) => void;
    onDeleteBranch: (branchId: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function GitTree({
    branches,
    currentBranchId,
    onSelectBranch,
    onDeleteBranch,
    isCollapsed = false,
    onToggleCollapse,
}: GitTreeProps) {
    const mainBranch = branches.find((b) => b.name === "main" || !b.parentBranchId);
    const childBranches = branches.filter((b) => b.parentBranchId);

    if (isCollapsed) {
        return (
            <div className="w-14 h-full bg-black border-l border-zinc-900 flex flex-col items-center py-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-9 w-9 mb-4 text-zinc-400 hover:text-white"
                >
                    <PanelRight className="h-4 w-4" />
                </Button>
                <div className="flex-1 flex flex-col items-center gap-3 mt-4">
                    {branches.slice(0, 6).map((branch) => (
                        <button
                            key={branch.id}
                            onClick={() => onSelectBranch(branch.id)}
                            title={branch.name}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all border",
                                currentBranchId === branch.id
                                    ? "bg-white border-white ring-2 ring-zinc-800"
                                    : "bg-black border-zinc-600 hover:border-zinc-400"
                            )}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 h-full bg-black border-l border-zinc-900 flex flex-col">
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-900">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-white" />
                    <span className="font-medium text-sm text-white">Tree</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-8 w-8 text-zinc-500 hover:text-white"
                >
                    <PanelRightClose className="h-4 w-4" />
                </Button>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto p-4">
                {branches.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600">
                        <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No branches</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Main Branch */}
                        {mainBranch && (
                            <div>
                                <div className="group relative flex items-center">
                                    <button
                                        onClick={() => onSelectBranch(mainBranch.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-all",
                                            currentBranchId === mainBranch.id
                                                ? "bg-zinc-900 border border-zinc-800"
                                                : "hover:bg-zinc-900/50 border border-transparent"
                                        )}
                                    >
                                        <GitCommit className={cn(
                                            "h-4 w-4",
                                            currentBranchId === mainBranch.id ? "text-white" : "text-zinc-500"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm",
                                                currentBranchId === mainBranch.id ? "text-white font-medium" : "text-zinc-400"
                                            )}>main</p>
                                        </div>
                                        {currentBranchId === mainBranch.id && (
                                            <span className="text-[10px] font-bold bg-white text-black px-1.5 py-0.5 rounded">HEAD</span>
                                        )}
                                    </button>
                                </div>

                                {/* Child branches from main */}
                                {childBranches.filter((b) => b.parentBranchId === mainBranch.id).length > 0 && (
                                    <div className="ml-5 mt-2 border-l border-zinc-800 pl-4 space-y-2">
                                        {childBranches
                                            .filter((b) => b.parentBranchId === mainBranch.id)
                                            .map((branch) => (
                                                <BranchNode
                                                    key={branch.id}
                                                    branch={branch}
                                                    allBranches={branches}
                                                    currentBranchId={currentBranchId}
                                                    onSelectBranch={onSelectBranch}
                                                    onDeleteBranch={onDeleteBranch}
                                                    depth={1}
                                                />
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

             {/* Footer Legend */}
             <div className="p-4 border-t border-zinc-900 text-[11px] text-zinc-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full border border-white bg-black" />
                        <span>Current</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full border border-zinc-600 bg-black" />
                        <span>Branch</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BranchNode({
    branch,
    allBranches,
    currentBranchId,
    onSelectBranch,
    onDeleteBranch,
    depth,
}: {
    branch: { id: string; name: string; parentBranchId: string | null; messageCount?: number };
    allBranches: { id: string; name: string; parentBranchId: string | null }[];
    currentBranchId: string | null;
    onSelectBranch: (id: string) => void;
    onDeleteBranch: (id: string) => void;
    depth: number;
}) {
    const childBranches = allBranches.filter((b) => b.parentBranchId === branch.id);
    const branchLabel = branch.name.startsWith("Branch ") ? `#${branch.name.slice(-6)}` : branch.name;
    const isMain = branch.name === "main";

    return (
        <div>
            {/* Connector line */}
            <div className="relative group">
                <div className="absolute -left-4 top-1/2 w-4 h-px bg-zinc-800" />
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onSelectBranch(branch.id)}
                        className={cn(
                            "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-sm border",
                            currentBranchId === branch.id
                                ? "bg-zinc-900 border-zinc-800 text-white"
                                : "hover:bg-zinc-900/50 border-transparent text-zinc-400 hover:text-zinc-300"
                        )}
                    >
                        <GitBranch className="h-3.5 w-3.5 opacity-70" />
                        <span className="font-mono truncate text-xs">{branchLabel}</span>
                    </button>

                    {/* Delete Option */}
                    {!isMain && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 hover:bg-zinc-900"
                                >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black border-zinc-800">
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteBranch(branch.id);
                                    }}
                                    className="text-red-500 focus:text-red-400 focus:bg-zinc-900 cursor-pointer text-xs"
                                >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete Branch
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Nested children */}
            {childBranches.length > 0 && depth < 3 && (
                <div className="ml-4 mt-1 border-l border-zinc-800 pl-3 space-y-1">
                    {childBranches.map((child) => (
                        <BranchNode
                            key={child.id}
                            branch={child}
                            allBranches={allBranches}
                            currentBranchId={currentBranchId}
                            onSelectBranch={onSelectBranch}
                            onDeleteBranch={onDeleteBranch}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
