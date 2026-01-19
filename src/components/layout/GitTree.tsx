"use client";

import React, { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BranchIcon } from "@/components/icons/BranchIcon";
import { MergeIcon } from "@/components/icons/MergeIcon";
import { DeleteIcon } from "@/components/icons/DeleteIcon";
import { PanelIcon } from "@/components/icons/PanelIcon";
import { PanelCloseIcon } from "@/components/icons/PanelCloseIcon";
import { cn } from "@/lib/utils";

interface GitTreeProps {
    branches: {
        id: string;
        name: string;
        parentBranchId: string | null;
        rootMessageId: string | null;
        messageCount?: number;
        isMerged?: boolean;
    }[];
    currentBranchId: string | null;
    onSelectBranch: (branchId: string) => void;
    onDeleteBranch: (branchId: string) => void;
    onMergeBranch?: (branchId: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    isMobile?: boolean;
}

export const GitTree = memo(function GitTree({
    branches,
    currentBranchId,
    onSelectBranch,
    onDeleteBranch,
    onMergeBranch,
    isCollapsed = false,
    onToggleCollapse,
    isMobile = false,
}: GitTreeProps) {
    const mainBranch = useMemo(() => branches.find((b) => b.name === "main" || !b.parentBranchId), [branches]);
    const childBranches = useMemo(() => branches.filter((b) => b.parentBranchId), [branches]);

    if (isCollapsed) {
        return (
            <div className="w-14 h-full bg-zinc-50 dark:bg-black border-l border-zinc-200 dark:border-zinc-900 flex flex-col items-center py-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-9 w-9 mb-4 text-zinc-400 hover:text-white"
                >
                    <PanelIcon className="h-4 w-4" />
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
                                    ? "bg-white dark:bg-white border-zinc-300 dark:border-white ring-2 ring-zinc-200 dark:ring-zinc-800"
                                    : "bg-zinc-200 dark:bg-black border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-400"
                            )}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "h-full bg-zinc-50 dark:bg-black flex flex-col",
            isMobile ? "w-full" : "w-[300px] border-l border-zinc-200 dark:border-zinc-900"
        )}>
            {/* Header - Hide on Mobile */}
            {!isMobile && (
                <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900">
                    <div className="flex items-center gap-2">
                        <BranchIcon className="h-4 w-4 text-zinc-900 dark:text-white" />
                        <span className="font-medium text-sm text-zinc-900 dark:text-white">Tree</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCollapse}
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    >
                        <PanelCloseIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Tree */}
            <div className="flex-1 overflow-y-auto p-4">
                {branches.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600">
                        <BranchIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
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
                                                ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                                                : "hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 border border-transparent"
                                        )}
                                    >
                                        <BranchIcon className={cn(
                                            "h-4 w-4",
                                            currentBranchId === mainBranch.id ? "text-zinc-900 dark:text-white" : "text-zinc-500"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm",
                                                currentBranchId === mainBranch.id ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-500 dark:text-zinc-400"
                                            )}>main</p>
                                        </div>
                                        {currentBranchId === mainBranch.id && (
                                            <span className="text-[10px] font-bold bg-zinc-900 dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded">HEAD</span>
                                        )}
                                    </button>
                                </div>

                                {/* Child branches from main */}
                                {childBranches.filter((b) => b.parentBranchId === mainBranch.id).length > 0 && (
                                    <div className="ml-5 mt-2 border-l border-zinc-200 dark:border-zinc-800 pl-4 space-y-2">
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
                                                    onMergeBranch={onMergeBranch}
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
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 text-[11px] text-zinc-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full border border-zinc-400 dark:border-white bg-zinc-200 dark:bg-black" />
                        <span>Current</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-black" />
                        <span>Branch</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

const BranchNode = memo(function BranchNode({
    branch,
    allBranches,
    currentBranchId,
    onSelectBranch,
    onDeleteBranch,
    onMergeBranch,
    depth,
}: {
    branch: { id: string; name: string; parentBranchId: string | null; messageCount?: number; isMerged?: boolean };
    allBranches: { id: string; name: string; parentBranchId: string | null; isMerged?: boolean }[];
    currentBranchId: string | null;
    onSelectBranch: (id: string) => void;
    onDeleteBranch: (id: string) => void;
    onMergeBranch?: (id: string) => void;
    depth: number;
}) {
    const childBranches = useMemo(() => allBranches.filter((b) => b.parentBranchId === branch.id), [allBranches, branch.id]);
    const branchLabel = branch.name.startsWith("Branch ") ? `#${branch.name.slice(-6)}` : branch.name;
    const isMain = branch.name === "main";
    const isActive = currentBranchId === branch.id;

    return (
        <div>
            {/* Connector line */}
            <div className="relative group">
                <div className="absolute -left-4 top-1/2 w-4 h-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onSelectBranch(branch.id)}
                        className={cn(
                            "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-sm border",
                            isActive
                                ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                                : "hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300"
                        )}
                    >
                        <BranchIcon className={cn("h-3.5 w-3.5", branch.isMerged ? "text-purple-400" : "opacity-70")} />
                        <span className={cn("font-mono truncate text-xs", branch.isMerged && "text-zinc-500 line-through")}>
                            {branchLabel}
                        </span>
                    </button>

                    {/* Options (Delete / Merge) */}
                    {!isMain && (
                        <div className="flex items-center gap-0.5 ml-1 shrink-0">
                            {onMergeBranch && !branch.isMerged && branch.parentBranchId && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMergeBranch(branch.id);
                                    }}
                                    disabled={!isActive}
                                    title="Merge into Parent"
                                    className={cn(
                                        "h-6 w-6 flex items-center justify-center rounded-md transition-colors",
                                        isActive
                                            ? "text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                            : "text-zinc-300 cursor-not-allowed"
                                    )}
                                >
                                    <MergeIcon className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteBranch(branch.id);
                                }}
                                title="Delete Branch"
                                className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <DeleteIcon className="h-3.5 w-3.5" />
                            </button>
                        </div>
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
                            onMergeBranch={onMergeBranch}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
