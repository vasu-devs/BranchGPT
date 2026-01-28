import { ThemeToggle } from "@/components/theme-toggle";
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
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
            ease: "easeOut"
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
                "h-full glass flex flex-col z-20 transition-all duration-500",
                !isMobile && "border-r border-white/10"
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
                                    <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                                        <div className="w-4 h-4 bg-background rounded-full" />
                                    </div>
                                    <span className="font-semibold text-lg tracking-tight whitespace-nowrap">BranchGPT</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            onClick={onToggleCollapse}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                            "w-full h-10 bg-background hover:bg-zinc-100 dark:hover:bg-zinc-900 text-foreground font-medium border border-border shadow-sm transition-all relative overflow-hidden group",
                            isCollapsed ? "px-0 justify-center" : "justify-start gap-3"
                        )}
                    >
                        <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <PlusIcon className="h-4 w-4 shrink-0" />
                            {!isCollapsed && <span>New Chat</span>}
                        </motion.button>
                    </Button>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                    <div className="space-y-1">
                        {!isCollapsed && (
                            <div className="px-3 py-2">
                                <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Recent Chats
                                </h3>
                            </div>
                        )}
                        {branches.length === 0 && !isCollapsed ? (
                            <p className="text-muted-foreground text-sm px-3 py-2">No conversations yet</p>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {branches.map((branch, i) => (
                                    <motion.div
                                        key={branch.id}
                                        custom={i}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -20 }}
                                        layout
                                        className="group relative flex items-center"
                                    >
                                        <button
                                            onClick={() => onSelectBranch(branch.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all relative overflow-hidden",
                                                currentBranchId === branch.id
                                                    ? "bg-background shadow-sm border border-border/50 text-foreground"
                                                    : "hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 text-muted-foreground hover:text-foreground",
                                                isCollapsed && "justify-center px-0"
                                            )}
                                            title={isCollapsed ? branch.name : undefined}
                                        >
                                            <ChatIcon className="h-4 w-4 shrink-0" />
                                            {!isCollapsed && (
                                                <div className="flex-1 min-w-0 z-10">
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
                                                    layoutId="activeTab"
                                                    className="absolute left-0 w-1 h-full bg-foreground rounded-r-full"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50">
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
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">User</p>
                                <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {!isCollapsed && <HelpDialog />}
                            {!isCollapsed && <ThemeToggle />}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
