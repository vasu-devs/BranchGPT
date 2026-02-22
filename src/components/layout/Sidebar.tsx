import { HelpDialog } from "./HelpDialog";
import { Button } from "@/components/ui/button";
import { PanelCloseIcon } from "@/components/icons/PanelCloseIcon";
import { PanelIcon } from "@/components/icons/PanelIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { ChatIcon } from "@/components/icons/ChatIcon";
import { DeleteIcon } from "@/components/icons/DeleteIcon";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence, Variants } from "framer-motion";

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
    isMobile?: boolean;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -15, filter: "blur(4px)" },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: {
            delay: i * 0.05,
            type: "spring",
            stiffness: 400,
            damping: 30
        }
    })
};

export function Sidebar({
    branches,
    currentBranchId,
    onSelectBranch,
    onNewChat,
    onDeleteConversation,
    isCollapsed = false,
    onToggleCollapse,
    isMobile = false,
}: SidebarProps) {
    return (
        <motion.div
            initial={false}
            animate={{ width: isMobile ? "100%" : (isCollapsed ? 60 : 300) }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                "h-full glass-panel flex flex-col z-20 transition-all duration-500",
                !isMobile && "border-r border-border/40"
            )}
        >
            <div className="flex flex-col h-full">
                {/* Header - Hide on Mobile since Sheet has context */}
                {!isMobile && (
                    <div className="h-16 px-4 flex items-center justify-between border-b border-border/50">
                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 overflow-hidden"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center p-0.5 shrink-0 shadow-inner border border-amber-500/20">
                                        <img src="/logo.png" alt="BranchGPT Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                    </div>
                                    <span className="font-semibold text-lg tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">BranchGPT</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            onClick={onToggleCollapse}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-zinc-100/50 :bg-zinc-800/50"
                        >
                            <motion.button whileHover={{ scale: 1.1, rotate: isCollapsed ? 0 : 90 }} whileTap={{ scale: 0.9 }}>
                                {isCollapsed ? <PanelIcon className="h-4 w-4" /> : <PanelCloseIcon className="h-4 w-4" />}
                            </motion.button>
                        </Button>
                    </div>
                )}

                {/* New Chat Button */}
                <div className="p-4">
                    <Button
                        onClick={onNewChat}
                        asChild
                        className={cn(
                            "w-full h-10 bg-white  hover:bg-zinc-50 :bg-zinc-800 text-foreground font-medium transition-all relative overflow-hidden group border border-border/50 shadow-sm hover:shadow-md",
                            isCollapsed ? "px-0 justify-center" : "justify-start gap-3"
                        )}
                    >
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/10  to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <PlusIcon className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-90 duration-300" />
                            {!isCollapsed && <span>New Chat</span>}
                        </motion.button>
                    </Button>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <div className="px-3 py-2">
                                <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest opacity-70">
                                    Recent Chats
                                </h3>
                            </div>
                        )}
                        {branches.length === 0 && !isCollapsed ? (
                            <p className="text-muted-foreground text-sm px-3 py-2 italic opacity-50">No conversations yet</p>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {branches.map((branch, i) => (
                                    <motion.div
                                        key={branch.id}
                                        custom={i}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                                        layout
                                        className="group relative flex items-center"
                                    >
                                        <button
                                            onClick={() => onSelectBranch(branch.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-300 z-10 relative",
                                                currentBranchId === branch.id
                                                    ? "text-primary-foreground shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground",
                                                isCollapsed && "justify-center px-0"
                                            )}
                                            title={isCollapsed ? branch.name : undefined}
                                        >
                                            <ChatIcon className={cn("h-4 w-4 shrink-0", currentBranchId === branch.id ? "text-primary-foreground" : "opacity-70")} />
                                            {!isCollapsed && (
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm truncate transition-colors",
                                                        currentBranchId === branch.id ? "font-medium" : "font-normal"
                                                    )}>
                                                        {branch.name}
                                                    </p>
                                                </div>
                                            )}
                                            {currentBranchId === branch.id && (
                                                <motion.div
                                                    layoutId="activeSidebarTabBackground"
                                                    className="absolute inset-0 bg-primary/95  rounded-xl -z-10 shadow-sm border border-black/5 "
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                        </button>

                                        {!isCollapsed && (
                                            <div className={cn(
                                                "absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20",
                                                currentBranchId === branch.id && "opacity-100"
                                            )}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 :bg-zinc-800/50">
                                                            <MoreIcon className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="glass-panel w-32">
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteConversation(branch.id);
                                                            }}
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                        >
                                                            <DeleteIcon className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* User/Footer */}
                <div className="p-4 border-t border-border/50">
                    <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                        <div className="w-8 h-8 rounded-full bg-slate-200  shrink-0" />
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">User</p>
                                <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {!isCollapsed && <HelpDialog />}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
