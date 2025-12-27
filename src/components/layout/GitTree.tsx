"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, GitCommit, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
    id: string;
    name: string;
    type: "branch" | "message";
    role?: "user" | "assistant" | "system";
    content?: string;
    children: TreeNode[];
    isActive?: boolean;
    isCurrent?: boolean;
}

interface GitTreeProps {
    branches: {
        id: string;
        name: string;
        parentBranchId: string | null;
        rootMessageId: string | null;
    }[];
    currentBranchId: string | null;
    onSelectBranch: (branchId: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function GitTree({
    branches,
    currentBranchId,
    onSelectBranch,
    isCollapsed = false,
    onToggleCollapse,
}: GitTreeProps) {
    // Build a tree structure from branches
    const mainBranch = branches.find((b) => b.name === "main" || !b.parentBranchId);
    const childBranches = branches.filter((b) => b.parentBranchId);

    if (isCollapsed) {
        return (
            <div className="w-12 h-full bg-sidebar/50 border-l flex flex-col items-center py-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-8 w-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    {branches.slice(0, 5).map((branch, index) => (
                        <button
                            key={branch.id}
                            onClick={() => onSelectBranch(branch.id)}
                            className={cn(
                                "w-3 h-3 rounded-full transition-all",
                                currentBranchId === branch.id
                                    ? "bg-primary ring-2 ring-primary/30"
                                    : branch.name === "main"
                                        ? "bg-emerald-500"
                                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 h-full bg-sidebar/50 border-l flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Branch Tree</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-8 w-8"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Tree Visualization */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                    {/* Main Branch */}
                    {mainBranch && (
                        <div className="relative">
                            {/* Main branch node */}
                            <button
                                onClick={() => onSelectBranch(mainBranch.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition-all",
                                    currentBranchId === mainBranch.id
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : "hover:bg-muted/50"
                                )}
                            >
                                <div className="relative">
                                    <GitCommit className="h-4 w-4 text-emerald-500" />
                                    {childBranches.filter((b) => b.parentBranchId === mainBranch.id).length > 0 && (
                                        <div className="absolute -bottom-3 left-1/2 w-px h-3 bg-emerald-500/50" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">main</p>
                                </div>
                                {currentBranchId === mainBranch.id && (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">
                                        HEAD
                                    </Badge>
                                )}
                            </button>

                            {/* Child branches from main */}
                            {childBranches.filter((b) => b.parentBranchId === mainBranch.id).length > 0 && (
                                <div className="ml-4 mt-2 space-y-1 border-l-2 border-primary/20 pl-4">
                                    {childBranches
                                        .filter((b) => b.parentBranchId === mainBranch.id)
                                        .map((branch, index) => (
                                            <BranchNode
                                                key={branch.id}
                                                branch={branch}
                                                allBranches={branches}
                                                currentBranchId={currentBranchId}
                                                onSelectBranch={onSelectBranch}
                                                depth={1}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Orphan branches (shouldn't happen but handle gracefully) */}
                    {!mainBranch && branches.length > 0 && (
                        <div className="space-y-1">
                            {branches.map((branch) => (
                                <BranchNode
                                    key={branch.id}
                                    branch={branch}
                                    allBranches={branches}
                                    currentBranchId={currentBranchId}
                                    onSelectBranch={onSelectBranch}
                                    depth={0}
                                />
                            ))}
                        </div>
                    )}

                    {branches.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">No branches yet</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Legend */}
            <div className="p-3 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>main</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>branch</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Recursive branch node component
function BranchNode({
    branch,
    allBranches,
    currentBranchId,
    onSelectBranch,
    depth,
}: {
    branch: { id: string; name: string; parentBranchId: string | null };
    allBranches: { id: string; name: string; parentBranchId: string | null }[];
    currentBranchId: string | null;
    onSelectBranch: (id: string) => void;
    depth: number;
}) {
    const childBranches = allBranches.filter((b) => b.parentBranchId === branch.id);
    const branchNumber = branch.name.replace("Branch ", "").slice(0, 8);

    return (
        <div className="relative">
            {/* Horizontal connector */}
            <div className="absolute -left-4 top-1/2 w-4 h-px bg-primary/30" />

            <button
                onClick={() => onSelectBranch(branch.id)}
                className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md w-full text-left transition-all text-sm",
                    currentBranchId === branch.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
            >
                <GitBranch className="h-3 w-3 text-primary/70" />
                <span className="truncate font-mono text-xs">
                    {branchNumber.length > 10 ? `#${branchNumber.slice(-6)}` : branch.name}
                </span>
                {currentBranchId === branch.id && (
                    <span className="text-[10px] text-primary">●</span>
                )}
            </button>

            {/* Nested children */}
            {childBranches.length > 0 && depth < 3 && (
                <div className="ml-4 mt-1 space-y-1 border-l border-primary/10 pl-3">
                    {childBranches.map((child) => (
                        <BranchNode
                            key={child.id}
                            branch={child}
                            allBranches={allBranches}
                            currentBranchId={currentBranchId}
                            onSelectBranch={onSelectBranch}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
