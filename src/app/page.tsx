"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatView } from "@/components/chat";
import { Sidebar } from "@/components/layout";
import { Message } from "@/db/schema";
import {
    getConversationHistory,
    createMessage,
    forkConversation,
    getMessageSiblings,
    initializeConversation,
    getBranchHead,
    getAllBranches,
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
    const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [branchName, setBranchName] = useState("main");
    const [isInitialized, setIsInitialized] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState<string | undefined>();
    const [allBranches, setAllBranches] = useState<BranchInfo[]>([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const loadAllBranches = useCallback(async () => {
        try {
            const branches = await getAllBranches();
            const branchesWithCount: BranchInfo[] = await Promise.all(
                branches.map(async (branch) => {
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
                        isMain: branch.name === "main",
                        parentBranchId: branch.parentBranchId,
                        rootMessageId: branch.rootMessageId,
                    };
                })
            );
            setAllBranches(branchesWithCount);
        } catch (error) {
            console.error("Failed to load branches:", error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const { branch, rootMessage } = await initializeConversation();
                setCurrentBranchId(branch.id);
                setBranchName(branch.name);
                if (rootMessage) {
                    setCurrentNodeId(rootMessage.id);
                    await loadConversation(rootMessage.id);
                }
                await loadAllBranches();
                setIsInitialized(true);
            } catch (error) {
                console.error("Database not connected, running in demo mode:", error);
                setIsInitialized(true);
                setDemoMode(true);
                setBranchName("demo");
            }
        };
        init();
    }, [loadAllBranches]);

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

    const handleSelectBranch = async (branchId: string) => {
        try {
            const head = await getBranchHead(branchId);
            const branch = allBranches.find((b) => b.id === branchId);
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
        setMessages([]);
        setCurrentNodeId(null);
        if (allBranches.length > 0) {
            const mainBranch = allBranches.find((b) => b.isMain);
            if (mainBranch) {
                setCurrentBranchId(mainBranch.id);
                setBranchName(mainBranch.name);
            }
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
            return fullContent;
        } catch (error) {
            console.error("Failed to stream AI response:", error);
            return null;
        } finally {
            setIsLoading(false);
            setStreamingContent(undefined);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (demoMode) {
            const demoUserMsg: MessageWithMeta = {
                id: `demo-${Date.now()}`,
                content,
                role: "user",
                parentId: null,
                branchId: "demo",
                isHead: true,
                createdAt: new Date(),
                siblingCount: 1,
                currentSiblingIndex: 0,
            };
            setMessages((prev) => [...prev, demoUserMsg]);
            const aiResponse = await streamAIResponse(content);
            if (aiResponse) {
                const demoAssistantMsg: MessageWithMeta = {
                    id: `demo-${Date.now() + 1}`,
                    content: aiResponse,
                    role: "assistant",
                    parentId: demoUserMsg.id,
                    branchId: "demo",
                    isHead: true,
                    createdAt: new Date(),
                    siblingCount: 1,
                    currentSiblingIndex: 0,
                };
                setMessages((prev) => [...prev, demoAssistantMsg]);
            }
            return;
        }

        if (!currentBranchId) return;

        try {
            const userMessage = await createMessage({
                content,
                role: "user",
                parentId: currentNodeId,
                branchId: currentBranchId,
                isHead: true,
            });
            setCurrentNodeId(userMessage.id);

            const { siblings, currentIndex } = await getMessageSiblings(userMessage.id);
            setMessages((prev) => [
                ...prev,
                {
                    ...userMessage,
                    siblingCount: siblings.length || 1,
                    currentSiblingIndex: currentIndex >= 0 ? currentIndex : 0,
                },
            ]);

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
                await loadConversation(savedMessage.id);
                await loadAllBranches();
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleFork = async (messageId: string, newContent: string) => {
        if (demoMode) return;
        if (!newContent.trim()) return;

        try {
            const { branch, message } = await forkConversation(messageId, newContent, "user");
            setCurrentBranchId(branch.id);
            setBranchName(branch.name);
            setCurrentNodeId(message.id);
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
                await loadConversation(savedMessage.id);
            }
            await loadAllBranches();
        } catch (error) {
            console.error("Failed to fork conversation:", error);
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
                const branch = allBranches.find((b) => b.id === newSibling.branchId);
                setBranchName(branch?.name || "Unknown");
                await loadConversation(head.id);
            }
        } catch (error) {
            console.error("Failed to navigate sibling:", error);
        }
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <div className="flex gap-1">
                    <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                branches={allBranches}
                currentBranchId={currentBranchId}
                onSelectBranch={handleSelectBranch}
                onNewChat={handleNewChat}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Chat */}
            <div className="flex-1 flex flex-col min-w-0">
                <ChatView
                    messages={messages}
                    branchName={branchName}
                    onSendMessage={handleSendMessage}
                    onFork={handleFork}
                    onNavigateSibling={handleNavigateSibling}
                    isLoading={isLoading}
                    streamingContent={streamingContent}
                />
            </div>
        </div>
    );
}
