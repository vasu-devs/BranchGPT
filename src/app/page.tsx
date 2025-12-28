"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatView } from "@/components/chat";
import { Sidebar, GitTree } from "@/components/layout";
import { Message } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetDescription,
    SheetTitle,
} from "@/components/ui/sheet";
import { MenuIcon } from "@/components/icons/MenuIcon";
import { BranchIcon } from "@/components/icons/BranchIcon";
import {
    getConversationHistory,
    createMessage,
    forkConversation,
    getMessageSiblings,
    createConversation,
    getConversations,
    getBranchHead,
    getBranchTree,
    deleteBranch,
    generateBranchTitle,
    updateBranchName,
    mergeBranch,
    getConversationsWithCounts,
} from "@/actions/messages";

interface MessageWithMeta extends Message {
    siblingCount: number;
    currentSiblingIndex: number;
}

interface BranchInfo {
    id: string;
    name: string;
    messageCount: number;
    createdAt: Date;
    isMain?: boolean;
    parentBranchId: string | null;
    rootMessageId: string | null;
    isMerged?: boolean;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<MessageWithMeta[]>([]);
    const [conversations, setConversations] = useState<BranchInfo[]>([]);
    // ... (start of component)

    // ... existing code ...



    const handleMergeBranch = async (branchId: string) => {
        setMergeConfirmation({ isOpen: true, branchId });
    };

    const confirmMerge = async () => {
        const { branchId } = mergeConfirmation;
        setMergeConfirmation(prev => ({ ...prev, isOpen: false }));

        setIsLoading(true);
        try {
            const parentBranchId = await mergeBranch(branchId);

            // Invalidate cache for parent branch so we fetch the new merge message
            setConversationCache(prev => {
                const newCache = { ...prev };
                delete newCache[parentBranchId];
                return newCache;
            });

            // Reload tree/conversations to reflect merged status
            // Ideally we just update local state but let's re-fetch to be safe and simple
            // In a real app we'd optimistic update

            await handleSelectConversation(currentConversationId!);

            // Switch to parent branch which now has the transcript
            await handleSelectBranch(parentBranchId, undefined, true);

        } catch (error) {
            console.error("Failed to merge branch:", error);
            alert("Failed to merge branch");
        } finally {
            setIsLoading(false);
        }
    };

    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [branchName, setBranchName] = useState("main");
    const [isInitialized, setIsInitialized] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState<string | undefined>();
    const [currentTreeBranches, setCurrentTreeBranches] = useState<BranchInfo[]>([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [gitTreeCollapsed, setGitTreeCollapsed] = useState(false);
    // Cache for conversation history: branchId -> messages
    const [conversationCache, setConversationCache] = useState<Record<string, MessageWithMeta[]>>({});

    // Deletion confirmation state
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        type: "conversation" | "branch";
        branchId: string;
        name: string;
    }>({
        isOpen: false,
        type: "branch",
        branchId: "",
        name: "",
    });

    const [mergeConfirmation, setMergeConfirmation] = useState<{
        isOpen: boolean;
        branchId: string;
    }>({
        isOpen: false,
        branchId: "",
    });

    // Load initial list of conversations
    useEffect(() => {
        const init = async () => {
            try {
                // Optimized single query fetch
                const conversationsWithCount = await getConversationsWithCounts();

                setConversations(conversationsWithCount.map(c => ({
                    ...c,
                    // Ensure types match BranchInfo
                    isMerged: c.isMerged ?? false
                })));

                // If no conversations, create one
                if (conversationsWithCount.length === 0) {
                    await handleNewChat();
                } else {
                    // Load the most recent one
                    await handleSelectConversation(conversationsWithCount[0].id);
                }
            } catch (error) {
                console.error("Failed to load conversations:", error);
                setDemoMode(true);
            } finally {
                setIsInitialized(true);
            }
        };
        init();
    }, []);

    // Load a specific conversation/tree
    const handleSelectConversation = async (rootBranchId: string) => {
        try {
            setCurrentConversationId(rootBranchId);

            // 1. Get all branches for this tree
            const allBranches = await getBranchTree(rootBranchId);

            // Filter branches relevant to this tree (descendants of root)
            // Since our backend currently fetches all, we filter here
            // But actually we need to traverse down from rootBranchId
            // A simple way is to find all branches where root or parent chain leads to rootBranchId

            // For now, let's just assume we want branches that are EITHER the root
            // OR have a parent in the list recursively.
            // Efficient approach: Build map of parent->children

            const treeBranches = allBranches.filter(b => true); // Placeholder - let's refine this

            // Actually, we can just use a recursive check or build the tree
            // Since we know the root, we can find its children, then their children...

            const buildTreeIds = (branches: typeof allBranches, rootId: string): Set<string> => {
                const ids = new Set<string>([rootId]);
                let added = true;
                while (added) {
                    added = false;
                    for (const b of branches) {
                        if (!ids.has(b.id) && b.parentBranchId && ids.has(b.parentBranchId)) {
                            ids.add(b.id);
                            added = true;
                        }
                    }
                }
                return ids;
            };

            const relevantIds = buildTreeIds(allBranches, rootBranchId);
            const filteredBranches = allBranches.filter(b => relevantIds.has(b.id));

            const branchesWithCount: BranchInfo[] = await Promise.all(
                filteredBranches.map(async (branch) => {
                    const head = await getBranchHead(branch.id);
                    let messageCount = 0;
                    if (head) {
                        const history = await getConversationHistory(head.id);
                        messageCount = history.length;
                    }
                    return {
                        id: branch.id,
                        name: branch.name,
                        messageCount,
                        createdAt: branch.createdAt,
                        isMain: branch.id === rootBranchId,
                        parentBranchId: branch.parentBranchId,
                        rootMessageId: branch.rootMessageId,
                    };
                })
            );

            setCurrentTreeBranches(branchesWithCount);

            // 2. Select the "HEAD" of this conversation (root branch head)
            await handleSelectBranch(rootBranchId, branchesWithCount);

        } catch (error) {
            console.error("Failed to select conversation:", error);
        }
    };

    const loadConversation = useCallback(async (nodeId: string) => {
        try {
            const history = await getConversationHistory(nodeId);
            const messagesWithMeta: MessageWithMeta[] = await Promise.all(
                history.map(async (msg) => {
                    const { siblings, currentIndex } = await getMessageSiblings(msg.id);
                    return {
                        ...msg,
                        siblingCount: siblings.length || 1,
                        currentSiblingIndex: currentIndex >= 0 ? currentIndex : 0,
                    };
                })
            );
            setMessages(messagesWithMeta);

            // Update cache
            if (messagesWithMeta.length > 0) {
                const branchId = messagesWithMeta[messagesWithMeta.length - 1].branchId;
                setConversationCache(prev => ({
                    ...prev,
                    [branchId]: messagesWithMeta
                }));
            }
        } catch (error) {
            console.error("Failed to load conversation:", error);
        }
    }, []);

    const handleSelectBranch = async (branchId: string, branchesOverride?: BranchInfo[], forceRefresh = false) => {
        try {
            const branchList = branchesOverride || currentTreeBranches;
            const branch = branchList.find((b) => b.id === branchId);

            setCurrentBranchId(branchId);
            setBranchName(branch?.name || "Unknown");

            // Check cache first
            if (!forceRefresh && conversationCache[branchId]) {
                setMessages(conversationCache[branchId]);
                const lastMsg = conversationCache[branchId][conversationCache[branchId].length - 1];
                setCurrentNodeId(lastMsg?.id || null);
                return; // Skip server fetch if cached
            }

            // Only fetch if not in cache
            const head = await getBranchHead(branchId);

            if (head) {
                setCurrentNodeId(head.id);
                await loadConversation(head.id);
            } else {
                setCurrentNodeId(null);
                setMessages([]);
                // Cache empty state
                setConversationCache(prev => ({
                    ...prev,
                    [branchId]: []
                }));
            }
        } catch (error) {
            console.error("Failed to switch branch:", error);
        }
    };

    const handleNewChat = async () => {
        try {
            const { branch, rootMessage } = await createConversation();

            // Add to conversations list
            const newConv: BranchInfo = {
                id: branch.id,
                name: branch.name,
                messageCount: 0,
                createdAt: branch.createdAt,
                parentBranchId: null,
                rootMessageId: null,
                isMain: true
            };

            setConversations(prev => [newConv, ...prev]);

            // Select it (will trigger tree load)
            // But since it's new/empty, we can shortcut
            setCurrentConversationId(branch.id);
            setCurrentTreeBranches([newConv]);
            setCurrentBranchId(branch.id);
            setBranchName(branch.name);
            setMessages([]);
            setCurrentNodeId(null);

        } catch (error) {
            console.error("Failed to create new chat:", error);
        }
    };

    const streamAIResponse = async (userContent: string) => {
        setIsLoading(true);
        setStreamingContent("");
        try {
            const aiMessages = messages.map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            }));
            aiMessages.push({ role: "user", content: userContent });

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: aiMessages }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const text = decoder.decode(value, { stream: true });
                    fullContent += text;
                    setStreamingContent(fullContent);
                }
            }
            setIsLoading(false);
            // NOTE: Don't clear streamingContent here - caller will clear it after appending saved message
            return fullContent;
        } catch (error) {
            console.error("Failed to stream AI response:", error);
            setIsLoading(false);
            setStreamingContent(undefined);
            return null;
        }
    };

    const handleSendMessage = async (content: string) => {
        if (demoMode) return;
        if (!currentBranchId) return;

        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: MessageWithMeta = {
            id: tempId,
            content,
            role: "user",
            parentId: currentNodeId,
            branchId: currentBranchId,
            isHead: true,
            createdAt: new Date(),
            siblingCount: 1,
            currentSiblingIndex: 0,
        };

        setMessages((prev) => {
            const newMessages = [...prev, optimisticMessage];
            // Update cache immediately
            setConversationCache(cache => ({
                ...cache,
                [currentBranchId]: newMessages
            }));
            return newMessages;
        });

        // Save current state for rollback if needed (basic)
        const previousNodeId = currentNodeId;

        try {
            // Note: We don't set CurrentNodeId to tempId because dependent actions need real ID
            // But for UI it's fine.

            const userMessage = await createMessage({
                content,
                role: "user",
                parentId: currentNodeId, // Use real parent ID
                branchId: currentBranchId,
                isHead: true,
            });

            setCurrentNodeId(userMessage.id);

            // Replace optimistic message with real onel
            setMessages((prev) => {
                const newMessages = prev.map(msg => msg.id === tempId ? {
                    ...userMessage,
                    siblingCount: 1, // simplified for now
                    currentSiblingIndex: 0
                } : msg);

                // Update cache with real ID
                setConversationCache(cache => ({
                    ...cache,
                    [currentBranchId]: newMessages
                }));

                return newMessages;
            });

            // We need to fetch siblings correctly now that it's persisted
            // But for performance effectively we just leave it as is until next load

            const aiResponse = await streamAIResponse(content);
            if (aiResponse && currentBranchId) {
                const savedMessage = await createMessage({
                    content: aiResponse,
                    role: "assistant",
                    parentId: userMessage.id,
                    branchId: currentBranchId,
                    isHead: true,
                });
                setCurrentNodeId(savedMessage.id);
                // Clear streaming FIRST, then append the saved message in same tick
                setStreamingContent(undefined);
                setMessages((prev) => {
                    const newMessages = [
                        ...prev,
                        {
                            ...savedMessage,
                            siblingCount: 1,
                            currentSiblingIndex: 0,
                        },
                    ];
                    // Update cache
                    setConversationCache(cache => ({
                        ...cache,
                        [currentBranchId]: newMessages
                    }));
                    return newMessages;
                });

                if (currentConversationId) {
                    // Silent update of tree
                    getBranchTree(currentConversationId).then(allBranches => {
                        // Re-run filter logic (duplicated for now, should refactor)
                        const buildTreeIds = (branches: typeof allBranches, rootId: string): Set<string> => {
                            const ids = new Set<string>([rootId]);
                            let added = true;
                            while (added) {
                                added = false;
                                for (const b of branches) {
                                    if (!ids.has(b.id) && b.parentBranchId && ids.has(b.parentBranchId)) {
                                        ids.add(b.id);
                                        added = true;
                                    }
                                }
                            }
                            return ids;
                        };
                        const relevantIds = buildTreeIds(allBranches, currentConversationId);
                        const filteredBranches = allBranches.filter(b => relevantIds.has(b.id));

                        Promise.all(
                            filteredBranches.map(async (branch) => {
                                const head = await getBranchHead(branch.id);
                                let messageCount = 0;
                                if (head) {
                                    const history = await getConversationHistory(head.id);
                                    messageCount = history.length;
                                }
                                return {
                                    id: branch.id,
                                    name: branch.name,
                                    messageCount,
                                    createdAt: branch.createdAt,
                                    isMain: branch.id === currentConversationId,
                                    parentBranchId: branch.parentBranchId,
                                    rootMessageId: branch.rootMessageId,
                                };
                            })
                        ).then(branchesWithCount => {
                            setCurrentTreeBranches(branchesWithCount);
                        });
                    });
                }

                // If this is the START of a new conversation (or a branch with default name), trigger naming
                if (messages.length === 0 && currentBranchId) {
                    generateBranchTitle(content).then(async (name) => {
                        if (!currentBranchId) return;
                        await updateBranchName(currentBranchId, name);
                        setBranchName(name);

                        // Update local state for sidebar and tree
                        setConversations(prev => prev.map(c => c.id === currentBranchId ? { ...c, name } : c));
                        setCurrentTreeBranches(prev => prev.map(b => b.id === currentBranchId ? { ...b, name } : b));
                    });
                }
            } else {
                setStreamingContent(undefined);
            }

        } catch (error) {
            console.error("Failed to send message:", error);
            // Rollback optimistic update
            setMessages((prev) => prev.filter(m => m.id !== tempId));
            setStreamingContent(undefined);
            alert(`Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const handleFork = async (messageId: string, newContent: string) => {
        if (demoMode) return;
        if (!newContent.trim()) return;

        const optimisticBranchId = `temp-branch-${Date.now()}`;
        const optimisticBranchName = `Branch...`;

        // 1. Optimistic UI update for branch switch
        const optimisticBranch: BranchInfo = {
            id: optimisticBranchId,
            name: optimisticBranchName,
            messageCount: 1, // User message
            createdAt: new Date(),
            parentBranchId: currentBranchId, // Approximate
            rootMessageId: messageId,
            isMain: false
        };

        // Add to tree immediately
        setCurrentTreeBranches(prev => [...prev, optimisticBranch]);
        setCurrentBranchId(optimisticBranchId);
        setBranchName(optimisticBranchName);

        // We also need to show the chat starting with the history up to messageId + new message
        // This is tricky because we need the history of the messageId.
        // We can grab it from current `messages` if messageId is in it.
        const messageIndex = messages.findIndex(m => m.id === messageId);
        let optimisticMessages: MessageWithMeta[] = [];

        if (messageIndex !== -1) {
            optimisticMessages = messages.slice(0, messageIndex + 1);
            // Add the new optimistic message
            const tempMsgId = `temp-fork-msg-${Date.now()}`;
            optimisticMessages.push({
                id: tempMsgId,
                content: newContent,
                role: "user",
                parentId: messageId,
                branchId: optimisticBranchId,
                isHead: true,
                createdAt: new Date(),
                siblingCount: 1,
                currentSiblingIndex: 0,
            });
            setMessages(optimisticMessages);
            // Update cache for new branch
            setConversationCache(cache => ({
                ...cache,
                [optimisticBranchId]: optimisticMessages
            }));
        } else {
            // Fallback: just clear or wait? 
            // If we can't find the history locally, we can't be purely optimistic about the history content.
            // But usually forking happens from a visible message.
            setMessages([]);
        }

        try {
            const { branch, message } = await forkConversation(messageId, newContent, "user");

            // 2. Fix up state with real data
            setCurrentBranchId(branch.id);
            setBranchName(branch.name);
            setCurrentNodeId(message.id);

            // Update the branch in the tree list
            setCurrentTreeBranches(prev => prev.map(b => b.id === optimisticBranchId ? {
                ...b,
                id: branch.id,
                name: branch.name,
                createdAt: branch.createdAt,
                parentBranchId: branch.parentBranchId,
                rootMessageId: branch.rootMessageId
            } : b));

            // Load the ACTUAL forked conversation history to be safe and accurate
            // (Takes a moment but user sees optimistic version meanwhile)
            await loadConversation(message.id);

            const aiResponse = await streamAIResponse(newContent);
            if (aiResponse && branch.id) {
                const savedMessage = await createMessage({
                    content: aiResponse,
                    role: "assistant",
                    parentId: message.id,
                    branchId: branch.id,
                    isHead: true,
                });
                setCurrentNodeId(savedMessage.id);
                // Clear streaming first, then append
                setStreamingContent(undefined);
                setMessages((prev) => [
                    ...prev,
                    {
                        ...savedMessage,
                        siblingCount: 1,
                        currentSiblingIndex: 0,
                    },
                ]);

                // Trigger Branch Naming
                generateBranchTitle(newContent).then(async (name) => {
                    await updateBranchName(branch.id, name);
                    setBranchName(name); // If we are still on this branch

                    // Update tree list
                    setCurrentTreeBranches(prev => prev.map(b => b.id === branch.id || b.id === optimisticBranchId ? { ...b, name, id: branch.id } : b));
                });
            } else {
                setStreamingContent(undefined);
            }
        } catch (error) {
            console.error("Failed to fork conversation:", error);
            setStreamingContent(undefined);
            // Rollback
            setCurrentTreeBranches(prev => prev.filter(b => b.id !== optimisticBranchId));
            alert("Failed to create branch.");
            // Ideally revert to previous branch but that state is lost here easily
            // Re-select original branch?
            if (currentBranchId) handleSelectBranch(currentBranchId);
        }
    };

    const handleNavigateSibling = async (messageId: string, direction: "prev" | "next") => {
        if (demoMode) return;
        try {
            const { siblings, currentIndex } = await getMessageSiblings(messageId);
            const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
            if (newIndex < 0 || newIndex >= siblings.length) return;

            const newSibling = siblings[newIndex];
            const head = await getBranchHead(newSibling.branchId);
            if (head) {
                setCurrentNodeId(head.id);
                setCurrentBranchId(newSibling.branchId);
                const branch = currentTreeBranches.find((b) => b.id === newSibling.branchId);
                setBranchName(branch?.name || "Unknown");
                await loadConversation(head.id);
            }
        } catch (error) {
            console.error("Failed to navigate sibling:", error);
        }
    };

    const handleDeleteConversation = (branchId: string) => {
        const branch = conversations.find((c) => c.id === branchId);
        if (!branch) return;
        setDeleteConfirmation({
            isOpen: true,
            type: "conversation",
            branchId,
            name: branch.name,
        });
    };

    const handleDeleteBranch = (branchId: string) => {
        const branch = currentTreeBranches.find((b) => b.id === branchId);
        if (!branch) return;
        setDeleteConfirmation({
            isOpen: true,
            type: "branch",
            branchId,
            name: branch.name,
        });
    };

    const confirmDelete = async () => {
        const { branchId, type } = deleteConfirmation;
        // Close immediately
        setDeleteConfirmation((prev) => ({ ...prev, isOpen: false }));

        try {
            if (type === "conversation") {
                await deleteBranch(branchId);
                // Update local state
                const newConversations = conversations.filter(c => c.id !== branchId);
                setConversations(newConversations);

                if (currentConversationId === branchId) {
                    if (newConversations.length > 0) {
                        await handleSelectConversation(newConversations[0].id);
                    } else {
                        await handleNewChat();
                    }
                }
            } else {
                // Find parent before deleting
                const branchToDelete = currentTreeBranches.find(b => b.id === branchId);
                const parentId = branchToDelete?.parentBranchId;

                await deleteBranch(branchId);

                if (currentConversationId) {
                    await handleSelectConversation(currentConversationId);
                    if (currentBranchId === branchId) {
                        if (parentId) {
                            await handleSelectBranch(parentId);
                        } else {
                            await handleSelectBranch(currentConversationId);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to delete:", error);
            alert("Failed to delete. Please try again.");
        }
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-black">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-zinc-900 dark:text-white font-bold text-lg">B</span>
                    </div>
                    <p className="text-zinc-500 text-sm">Loading BranchGPT...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] bg-white dark:bg-black flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-white dark:bg-black shrink-0 relative z-30">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <MenuIcon className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[300px]">
                        <SheetTitle className="sr-only">Navigation</SheetTitle>
                        <Sidebar
                            branches={conversations}
                            currentBranchId={currentConversationId}
                            onSelectBranch={handleSelectConversation}
                            onNewChat={handleNewChat}
                            onDeleteConversation={handleDeleteConversation}
                            isMobile={true}
                        />
                    </SheetContent>
                </Sheet>

                <span className="font-semibold text-sm">BranchGPT</span>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2">
                            <BranchIcon className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 w-[300px] border-l">
                        <SheetTitle className="sr-only">Git Tree</SheetTitle>
                        <GitTree
                            branches={currentTreeBranches}
                            currentBranchId={currentBranchId}
                            onSelectBranch={handleSelectBranch}
                            onDeleteBranch={handleDeleteBranch}
                            onMergeBranch={handleMergeBranch}
                            isMobile={true}
                        />
                    </SheetContent>
                </Sheet>
            </header>

            {/* Sidebar - Lists Conversations (Desktop) */}
            <div className="hidden md:flex h-full shrink-0">
                <Sidebar
                    branches={conversations}
                    currentBranchId={currentConversationId}
                    onSelectBranch={handleSelectConversation}
                    onNewChat={handleNewChat}
                    onDeleteConversation={handleDeleteConversation}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background border-x border-zinc-200 dark:border-zinc-800 shadow-sm z-10 overflow-hidden">
                <ChatView
                    messages={messages}
                    branchName={branchName}
                    onSendMessage={handleSendMessage}
                    onFork={handleFork}
                    onNavigateSibling={handleNavigateSibling}
                    isLoading={isLoading}
                    streamingContent={streamingContent}
                />
            </main>

            {/* Git Tree (Desktop) */}
            <div className="hidden md:flex h-full shrink-0">
                <GitTree
                    branches={currentTreeBranches}
                    currentBranchId={currentBranchId}
                    onSelectBranch={handleSelectBranch}
                    onDeleteBranch={handleDeleteBranch}
                    onMergeBranch={handleMergeBranch}
                    isCollapsed={gitTreeCollapsed}
                    onToggleCollapse={() => setGitTreeCollapsed(!gitTreeCollapsed)}
                />
            </div>

            <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete {deleteConfirmation.type === "branch" ? "Branch" : "Chat"}</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                            Are you sure you want to delete "{deleteConfirmation.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={mergeConfirmation.isOpen} onOpenChange={(open) => setMergeConfirmation(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Merge Branch</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                            Are you sure you want to merge this branch into its parent? This will summarize the conversation and add it to the parent branch.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setMergeConfirmation(prev => ({ ...prev, isOpen: false }))}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmMerge}
                            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        >
                            Merge Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
