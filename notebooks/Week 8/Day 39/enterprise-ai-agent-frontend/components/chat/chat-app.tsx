"use client";

import { Menu, Plus, Sparkles } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { getChatHistory, sendChatMessage } from "@/lib/api";
import type {
  ChatMessage,
  Conversation,
  HistoryResponse,
} from "@/lib/types";

const storageKey = "xander.chat-sessions.v1";

function createConversation(): Conversation {
  return {
    sessionId: crypto.randomUUID(),
    title: "New chat",
    updatedAt: new Date().toISOString(),
    isNew: true,
  };
}

function isConversation(value: unknown): value is Conversation {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.sessionId === "string" &&
    typeof item.title === "string" &&
    typeof item.updatedAt === "string" &&
    typeof item.isNew === "boolean"
  );
}

function sortConversations(items: Conversation[]) {
  return [...items].sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() -
      new Date(first.updatedAt).getTime(),
  );
}

function mapHistory(history: HistoryResponse, sessionId: string) {
  return history.messages.map((message, index) => ({
    id: `${sessionId}-${index}`,
    role: message.role,
    content: message.content,
  })) satisfies ChatMessage[];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const activeIdRef = useRef<string | null>(null);
  const historyRequestRef = useRef(0);

  useEffect(() => {
    let restored: Conversation[] = [];

    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          restored = parsed.filter(isConversation);
          if (restored.length !== parsed.length) {
            setError(
              "Some saved conversations could not be restored. Start a new chat or choose a saved one.",
            );
          }
        } else {
          setError(
            "Saved conversations could not be read. Start a new chat to continue.",
          );
        }
      }
    } catch {
      setError(
        "Saved conversations are unavailable in this browser. You can still start a new chat.",
      );
    }

    const sorted = sortConversations(restored);
    setConversations(sorted);
    if (sorted.length > 0) {
      const firstConversation = sorted[0];
      activeIdRef.current = firstConversation.sessionId;
      setActiveId(firstConversation.sessionId);
      if (!firstConversation.isNew) {
        const requestId = ++historyRequestRef.current;
        setIsLoadingHistory(true);
        void getChatHistory(firstConversation.sessionId)
          .then((history) => {
            if (historyRequestRef.current !== requestId) return;
            if (history.session_id !== firstConversation.sessionId) {
              throw new Error(
                "The history service returned a different session ID.",
              );
            }
            setMessages(mapHistory(history, firstConversation.sessionId));
          })
          .catch((historyError: unknown) => {
            if (historyRequestRef.current !== requestId) return;
            setError(getErrorMessage(historyError));
          })
          .finally(() => {
            if (historyRequestRef.current === requestId) {
              setIsLoadingHistory(false);
            }
          });
      }
    } else {
      const freshConversation = createConversation();
      activeIdRef.current = freshConversation.sessionId;
      setActiveId(freshConversation.sessionId);
      setConversations([freshConversation]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(conversations));
    } catch {
      setError(
        "This browser could not save your conversation list. Your current chat will remain available until you leave.",
      );
    }
  }, [conversations, hydrated]);

  const startNewChat = useCallback(() => {
    if (isSending || isLoadingHistory) return;
    historyRequestRef.current += 1;
    const conversation = createConversation();
    activeIdRef.current = conversation.sessionId;
    setActiveId(conversation.sessionId);
    setMessages([]);
    setDraft("");
    setError(null);
    setIsLoadingHistory(false);
    setConversations((current) => sortConversations([conversation, ...current]));
    setIsMobileSidebarOpen(false);
  }, [isLoadingHistory, isSending]);

  const selectConversation = useCallback(
    (conversation: Conversation) => {
      if (
        conversation.sessionId === activeIdRef.current ||
        isSending ||
        isLoadingHistory
      ) {
        setIsMobileSidebarOpen(false);
        return;
      }

      const requestId = ++historyRequestRef.current;
      activeIdRef.current = conversation.sessionId;
      setActiveId(conversation.sessionId);
      setMessages([]);
      setDraft("");
      setError(null);
      setIsMobileSidebarOpen(false);

      if (conversation.isNew) {
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      void getChatHistory(conversation.sessionId)
        .then((history) => {
          if (historyRequestRef.current !== requestId) return;
          if (history.session_id !== conversation.sessionId) {
            throw new Error(
              "The history service returned a different session ID.",
            );
          }
          setMessages(mapHistory(history, conversation.sessionId));
        })
        .catch((historyError: unknown) => {
          if (historyRequestRef.current !== requestId) return;
          setError(getErrorMessage(historyError));
        })
        .finally(() => {
          if (historyRequestRef.current === requestId) {
            setIsLoadingHistory(false);
          }
        });
    },
    [isLoadingHistory, isSending],
  );

  const sendMessage = useCallback(
    async (rawMessage: string) => {
      const query = rawMessage.trim();
      const sessionId = activeIdRef.current;
      if (!query || !sessionId || isSending || isLoadingHistory) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: query,
      };
      setError(null);
      setDraft("");
      setMessages((current) => [...current, userMessage]);
      setIsSending(true);

      try {
        const response = await sendChatMessage({
          query,
          session_id: sessionId,
        });
        if (response.session_id !== sessionId) {
          throw new Error("The chat service returned a different session ID.");
        }
        const answer = response.answer.trim();
        if (!answer) {
          throw new Error(
            "The agent returned an empty response. Your message is ready to try again.",
          );
        }

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: "ai",
            content: answer,
          },
        ]);
        setConversations((current) =>
          sortConversations(
            current.map((conversation) =>
              conversation.sessionId === sessionId
                ? {
                    ...conversation,
                    title: conversation.isNew
                      ? query.replace(/\s+/g, " ").slice(0, 48) ||
                        "New conversation"
                      : conversation.title,
                    isNew: false,
                    updatedAt: new Date().toISOString(),
                  }
                : conversation,
            ),
          ),
        );
      } catch (sendError: unknown) {
        setMessages((current) =>
          activeIdRef.current === sessionId
            ? current.filter((message) => message.id !== userMessage.id)
            : current,
        );
        setDraft(query);
        setError(getErrorMessage(sendError));
      } finally {
        setIsSending(false);
      }
    },
    [isLoadingHistory, isSending],
  );

  const activeConversation = conversations.find(
    (conversation) => conversation.sessionId === activeId,
  );

  return (
    <main className="app-shell">
      <ChatSidebar
        activeId={activeId}
        conversations={conversations}
        isBusy={isSending || isLoadingHistory}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onNewChat={startNewChat}
        onSelect={selectConversation}
      />

      <section className="chat-main" aria-label="Chat with Xander">
        <header className="chat-header">
          <div className="header-leading">
            <button
              aria-label="Open conversations"
              className="icon-button mobile-menu-button"
              onClick={() => setIsMobileSidebarOpen(true)}
              type="button"
            >
              <Menu size={19} />
            </button>
            <span className="mobile-brand-mark" aria-hidden="true">
              <Sparkles size={16} />
            </span>
            <div className="header-title-group">
              <div className="header-title">
                {activeConversation?.isNew
                  ? "New chat"
                  : activeConversation?.title ?? "Xander"}
              </div>
              <div className="header-subtitle">AI assistant</div>
            </div>
          </div>
          <div className="header-actions">
            <button
              aria-label="Start a new chat"
              className="icon-button header-new-chat"
              disabled={isSending || isLoadingHistory}
              onClick={startNewChat}
              title="New chat"
              type="button"
            >
              <Plus size={19} />
            </button>
          </div>
        </header>

        <div className="chat-scroll-area">
          {error ? (
            <div className="error-notice" role="alert">
              <span>{error}</span>
              <button
                aria-label="Dismiss error"
                onClick={() => setError(null)}
                type="button"
              >
                Dismiss
              </button>
            </div>
          ) : null}
          {isLoadingHistory ? (
            <div className="history-loading" role="status">
              <span className="loading-spinner" />
              Loading conversation…
            </div>
          ) : (
            <ChatMessages
              isLoading={isSending}
              messages={messages}
              onSuggestion={(prompt) => void sendMessage(prompt)}
            />
          )}
        </div>

        <ChatComposer
          disabled={isLoadingHistory}
          isSending={isSending}
          onChange={setDraft}
          onSubmit={() => void sendMessage(draft)}
          value={draft}
        />
      </section>
    </main>
  );
}
