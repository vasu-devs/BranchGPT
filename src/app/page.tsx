"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatView } from "@/components/chat";
import { Message } from "@/db/schema";
import {
  getConversationHistory,
  createMessage,
  forkConversation,
  getMessageSiblings,
  initializeConversation,
  getBranchHead,
} from "@/actions/messages";
import { useChat } from "@ai-sdk/react";

interface MessageWithMeta extends Message {
  siblingCount: number;
  currentSiblingIndex: number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageWithMeta[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState("main");
  const [isInitialized, setIsInitialized] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // AI Chat hook with new v6 API
  const {
    messages: aiMessages,
    status,
    setMessages: setAiMessages,
    handleSubmit,
    input,
    setInput,
  } = useChat({
    onFinish: async (message) => {
      if (currentBranchId && currentNodeId && !demoMode) {
        // Extract content from message parts
        const content = message.parts
          ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
          .map((part) => part.text)
          .join("") || "";

        if (content) {
          // Save assistant message to database
          const savedMessage = await createMessage({
            content,
            role: "assistant",
            parentId: currentNodeId,
            branchId: currentBranchId,
            isHead: true,
          });
          setCurrentNodeId(savedMessage.id);
          await loadConversation(savedMessage.id);
        }
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Initialize conversation on first load
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
        setIsInitialized(true);
      } catch (error) {
        // If database is not connected, run in demo mode
        console.error("Database not connected, running in demo mode:", error);
        setIsInitialized(true);
        setDemoMode(true);
        setBranchName("demo (no db)");
      }
    };
    init();
  }, []);

  // Load conversation history with sibling metadata
  const loadConversation = useCallback(async (nodeId: string) => {
    try {
      const history = await getConversationHistory(nodeId);

      // Add sibling metadata to each message
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

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (demoMode) {
      // In demo mode, just use the AI directly
      setInput(content);
      // Create a synthetic form event to submit
      const syntheticEvent = {
        preventDefault: () => { },
      } as React.FormEvent<HTMLFormElement>;
      handleSubmit(syntheticEvent);
      return;
    }

    if (!currentBranchId) return;

    try {
      // Save user message to database
      const userMessage = await createMessage({
        content,
        role: "user",
        parentId: currentNodeId,
        branchId: currentBranchId,
        isHead: true,
      });

      setCurrentNodeId(userMessage.id);

      // Update local messages immediately
      const { siblings, currentIndex } = await getMessageSiblings(userMessage.id);
      setMessages((prev) => [
        ...prev,
        {
          ...userMessage,
          siblingCount: siblings.length || 1,
          currentSiblingIndex: currentIndex >= 0 ? currentIndex : 0,
        },
      ]);

      // Trigger AI response
      setInput(content);
      const syntheticEvent = {
        preventDefault: () => { },
      } as React.FormEvent<HTMLFormElement>;
      handleSubmit(syntheticEvent);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle forking from a message
  const handleFork = async (messageId: string) => {
    if (demoMode) {
      alert("Fork is not available in demo mode. Please connect a database.");
      return;
    }

    const newContent = prompt("Enter your message for the new branch:");
    if (!newContent) return;

    try {
      const { branch, message } = await forkConversation(
        messageId,
        newContent,
        "user"
      );

      setCurrentBranchId(branch.id);
      setBranchName(branch.name);
      setCurrentNodeId(message.id);
      await loadConversation(message.id);

      // Trigger AI response for the fork
      setInput(newContent);
      const syntheticEvent = {
        preventDefault: () => { },
      } as React.FormEvent<HTMLFormElement>;
      handleSubmit(syntheticEvent);
    } catch (error) {
      console.error("Failed to fork conversation:", error);
    }
  };

  // Handle navigating between siblings
  const handleNavigateSibling = async (
    messageId: string,
    direction: "prev" | "next"
  ) => {
    if (demoMode) return;

    try {
      const { siblings, currentIndex } = await getMessageSiblings(messageId);
      const newIndex =
        direction === "prev" ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= siblings.length) return;

      const newSibling = siblings[newIndex];

      // Find the head of the branch containing this sibling
      const head = await getBranchHead(newSibling.branchId);
      if (head) {
        setCurrentNodeId(head.id);
        setCurrentBranchId(newSibling.branchId);
        await loadConversation(head.id);
      }
    } catch (error) {
      console.error("Failed to navigate sibling:", error);
    }
  };

  // Get streaming content from AI messages
  const getStreamingContent = () => {
    if (!isLoading) return undefined;
    const lastMessage = aiMessages[aiMessages.length - 1];
    if (lastMessage?.role === "assistant") {
      return lastMessage.parts
        ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("");
    }
    return undefined;
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">
          Initializing BranchGPT...
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen">
      <ChatView
        messages={messages}
        branchName={branchName}
        onSendMessage={handleSendMessage}
        onFork={handleFork}
        onNavigateSibling={handleNavigateSibling}
        isLoading={isLoading}
        streamingContent={getStreamingContent()}
      />
    </main>
  );
}
