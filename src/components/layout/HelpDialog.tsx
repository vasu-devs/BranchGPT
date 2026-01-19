"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpIcon } from "@/components/icons/HelpIcon";
import { BranchIcon } from "@/components/icons/BranchIcon";
import { MergeIcon } from "@/components/icons/MergeIcon";
import { ForkIcon } from "@/components/icons/ForkIcon";
import { cn } from "@/lib/utils";

export function HelpDialog({ children }: { children?: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <HelpIcon className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <BranchIcon className="h-5 w-5" />
                        How to use BranchGPT
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                        Explore different directions in your conversations with branching and merging.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <section className="space-y-3">
                        <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">1</span>
                            Linear Chat
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 pl-8">
                            Talk to the AI as you normally would. Your messages are stored in a branch (defaultly named 'main').
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">2</span>
                            Forking (Branching)
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 pl-8">
                            Hover over any message and click <strong className="text-zinc-900 dark:text-white inline-flex items-center gap-1"><ForkIcon className="h-3 w-3" /> Fork</strong>.
                            This creates a new path from that exact point, allowing you to try different prompts while keeping the history before it.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">3</span>
                            The Tree View
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 pl-8">
                            Use the sidebar on the right to see your "conversation tree". You can jump between different branches instantly.
                            Nodes with a <strong className="text-purple-500">purple</strong> icon indicate they have been merged.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">4</span>
                            Merging
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 pl-8">
                            If you like what happened in a branch, you can click <strong className="text-zinc-900 dark:text-white inline-flex items-center gap-1"><MergeIcon className="h-3 w-3" /> Merge</strong>.
                            The AI will summarize the branch and add it back to the parent conversation as a single system message.
                        </p>
                    </section>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-center">
                        <p className="text-xs text-zinc-400 italic text-center max-w-xs">
                            "Think of every message as a node in a git repository. You aren't just chatting; you're building a knowledge graph."
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
