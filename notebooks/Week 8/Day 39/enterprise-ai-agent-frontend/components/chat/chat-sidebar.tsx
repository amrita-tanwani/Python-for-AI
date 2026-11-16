"use client";

import {
  Check,
  MessageSquareText,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import type { Conversation } from "@/lib/types";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  isBusy: boolean;
  onNewChat: () => void;
  onSelect: (conversation: Conversation) => void;
  onClose: () => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  isOpen,
  isBusy,
  onNewChat,
  onSelect,
  onClose,
}: ChatSidebarProps) {
  return (
    <>
      <button
        aria-label="Close conversation menu"
        className={`sidebar-scrim${isOpen ? " is-visible" : ""}`}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <aside className={`sidebar${isOpen ? " is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <Sparkles size={17} strokeWidth={2.2} />
            </span>
            <span className="brand-name">Xander</span>
          </div>
          <button
            aria-label="Close sidebar"
            className="icon-button sidebar-close"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <button
          className="new-chat-button"
          disabled={isBusy}
          onClick={onNewChat}
          type="button"
        >
          <Plus size={17} strokeWidth={2} />
          <span>New chat</span>
        </button>

        <div className="conversation-section">
          <div className="section-label">Your conversations</div>
          <nav aria-label="Conversations" className="conversation-list">
            {conversations.length === 0 ? (
              <p className="sidebar-empty">Your chats will show up here.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  aria-current={
                    conversation.sessionId === activeId ? "page" : undefined
                  }
                  className={`conversation-link${
                    conversation.sessionId === activeId ? " is-active" : ""
                  }`}
                  disabled={isBusy}
                  key={conversation.sessionId}
                  onClick={() => onSelect(conversation)}
                  type="button"
                >
                  <MessageSquareText size={16} strokeWidth={1.7} />
                  <span className="conversation-title">
                    {conversation.title}
                  </span>
                  {conversation.isNew ? (
                    <span className="new-indicator" title="New conversation">
                      <span className="sr-only">New</span>
                    </span>
                  ) : conversation.sessionId === activeId ? (
                    <Check
                      aria-hidden="true"
                      className="conversation-check"
                      size={14}
                    />
                  ) : null}
                </button>
              ))
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <span className="sidebar-agent-mark" aria-hidden="true">
            <Sparkles size={14} />
          </span>
          <div>
            <span className="sidebar-footer-title">Xander assistant</span>
            <span className="sidebar-footer-caption">LangGraph agent</span>
          </div>
        </div>
      </aside>
    </>
  );
}
