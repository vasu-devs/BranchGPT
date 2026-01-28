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
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto glass-card shadow-3xl border-white/20 dark:border-white/5">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight text-gradient">
                        <BranchIcon className="h-6 w-6 text-slate-400" />
                        How to use BranchGPT
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 text-base">
                        Master the power of parallel conversation paths.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    <section className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3 text-lg">
                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold shadow-sm">1</span>
                            Linear Chat
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 pl-11 leading-relaxed">
                            Start your journey on the <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-slate-100 font-bold">main</code> branch. Every message you send builds nodes on this primary timeline.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3 text-lg">
                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold shadow-sm">2</span>
                            Forking (Branching)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 pl-11 leading-relaxed">
                            Explore "what ifs" by hovering over any message and clicking <strong className="text-slate-900 dark:text-slate-100 inline-flex items-center gap-1.5"><ForkIcon className="h-4 w-4" /> Fork</strong>. 
                            This preserves the history up to that point and starts a new parallel reality.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3 text-lg">
                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold shadow-sm">3</span>
                            The Tree View
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 pl-11 leading-relaxed">
                            Toggle the right sidebar to visualize your <strong className="text-slate-900 dark:text-slate-100">Conversation Tree</strong>. Jump between branches instantly to see how different paths unfolded.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3 text-lg">
                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold shadow-sm">4</span>
                            Merging
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 pl-11 leading-relaxed">
                            Bring insights back to main by clicking <strong className="text-purple-500 inline-flex items-center gap-1.5"><MergeIcon className="h-4 w-4" /> Merge</strong>. 
                            The AI will distill your exploration into a concise summary injected into the parent branch.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-white/5 flex justify-center">
                        <p className="text-xs text-slate-400/80 italic text-center max-w-sm leading-relaxed">
                            "Conversation isn't a line; it's a living graph. In BranchGPT, you control the dimensions of thought."
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
