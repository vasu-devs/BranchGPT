"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatView } from "@/components/chat";
import { Sidebar, GitTree } from "@/components/layout";
import { Message } from "@/db/schema";
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
}

export default function ChatPage() {
    const [messages, setMessages] = useState<MessageWithMeta[]>([]);
    const [conversations, setConversations] = useState<BranchInfo[]>([]);
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

    // Load initial list of conversations
    useEffect(() => {
        const init = async () => {
            try {
                const roots = await getConversations();
                const conversationsWithCount: BranchInfo[] = await Promise.all(
                    roots.map(async (branch) => {
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
                            parentBranchId: null,
                            rootMessageId: null,
                        };
                    })
                );
                setConversations(conversationsWithCount);

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
        } catch (error) {
            console.error("Failed to load conversation:", error);
        }
    }, []);

    const handleSelectBranch = async (branchId: string, branchesOverride?: BranchInfo[]) => {
        try {
            const branchList = branchesOverride || currentTreeBranches;
            const branch = branchList.find((b) => b.id === branchId);
            const head = await getBranchHead(branchId);
            
            setCurrentBranchId(branchId);
            setBranchName(branch?.name || "Unknown");
            
            if (head) {
                setCurrentNodeId(head.id);
                await loadConversation(head.id);
            } else {
                setCurrentNodeId(null);
                setMessages([]);
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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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

        setMessages((prev) => [...prev, optimisticMessage]);
        
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
            setMessages((prev) => 
                prev.map(msg => msg.id === tempId ? {
                    ...userMessage,
                    siblingCount: 1, // simplified for now
                    currentSiblingIndex: 0
                } : msg)
            );

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
                setMessages((prev) => [
                    ...prev,
                    {
                        ...savedMessage,
                        siblingCount: 1,
                        currentSiblingIndex: 0,
                    },
                ]);
                
                // Update branch message counts (optional optimization, for now reload tree)
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
            } else {
                setStreamingContent(undefined);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            // Rollback optimistic update
            setMessages((prev) => prev.filter(m => m.id !== tempId));
            setStreamingContent(undefined);
            alert("Failed to send message. Please try again.");
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

    const handleDeleteConversation = async (branchId: string) => {
        if (!confirm("Are you sure you want to delete this chat? This cannot be undone.")) return;
        
        try {
            await deleteBranch(branchId);
            
            // Update local state
            const newConversations = conversations.filter(c => c.id !== branchId);
            setConversations(newConversations);
            
            // If we deleted the current conversation, switch to another
            if (currentConversationId === branchId) {
                if (newConversations.length > 0) {
                    await handleSelectConversation(newConversations[0].id);
                } else {
                    await handleNewChat();
                }
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    };

    const handleDeleteBranch = async (branchId: string) => {
        if (!confirm("Are you sure you want to delete this branch?")) return;
        
        try {
            // Find parent before deleting to switch to it
            const branchToDelete = currentTreeBranches.find(b => b.id === branchId);
            const parentId = branchToDelete?.parentBranchId;
            
            await deleteBranch(branchId);
            
            // Reload tree
            if (currentConversationId) {
                await handleSelectConversation(currentConversationId);
                
                // If we deleted the active branch, switch to parent or root
                if (currentBranchId === branchId) {
                    if (parentId) {
                        await handleSelectBranch(parentId);
                    } else {
                        // This shouldn't happen for handleDeleteBranch on non-root, 
                        // but if it does, fallback to root of conversation
                        await handleSelectBranch(currentConversationId);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to delete branch:", error);
        }
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border border-zinc-800 bg-black flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <p className="text-zinc-500 text-sm">Loading BranchGPT...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black">
            {/* Sidebar - Lists Conversations */}
            <Sidebar
                branches={conversations}
                currentBranchId={currentConversationId}
                onSelectBranch={handleSelectConversation}
                onNewChat={handleNewChat}
                onDeleteConversation={handleDeleteConversation}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 border-x border-zinc-900">
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

            {/* Git Tree - Lists Branches for Current Conversation */}
            <GitTree
                branches={currentTreeBranches}
                currentBranchId={currentBranchId}
                onSelectBranch={handleSelectBranch}
                onDeleteBranch={handleDeleteBranch}
                isCollapsed={gitTreeCollapsed}
                onToggleCollapse={() => setGitTreeCollapsed(!gitTreeCollapsed)}
            />
        </div>
    );
}
