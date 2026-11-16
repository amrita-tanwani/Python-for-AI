"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";
import {
  Check,
  Clipboard,
  Code2,
  FileText,
  Lightbulb,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSuggestion: (prompt: string) => void;
}

const suggestions = [
  {
    icon: MessageCircle,
    title: "Get a recommendation",
    prompt: "Can you recommend something from the menu?",
  },
  {
    icon: FileText,
    title: "Ask about an order",
    prompt: "How can I get help with an order?",
  },
  {
    icon: Lightbulb,
    title: "Talk through an idea",
    prompt: "Help me think through an idea I have.",
  },
];

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }
  if (isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return "";
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const codeElement = isValidElement<{
    className?: string;
    children?: React.ReactNode;
  }>(children)
    ? children
    : null;
  const language =
    codeElement?.props.className?.match(/language-([\w.+-]+)/)?.[1] ?? "code";
  const code = getNodeText(children).replace(/\n$/, "");

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1600);
    } catch {
      setCopyStatus("failed");
      window.setTimeout(() => setCopyStatus("idle"), 2400);
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>
          <Code2 size={14} />
          {language}
        </span>
        <button
          aria-label={
            copyStatus === "copied"
              ? "Code copied"
              : copyStatus === "failed"
                ? "Could not copy code"
                : "Copy code"
          }
          className="copy-button"
          onClick={() => void copyCode()}
          type="button"
        >
          {copyStatus === "copied" ? (
            <Check size={14} />
          ) : (
            <Clipboard size={14} />
          )}
          {copyStatus === "copied"
            ? "Copied"
            : copyStatus === "failed"
              ? "Copy failed"
              : "Copy"}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

const markdownComponents: Components = {
  pre({ children }) {
    return <CodeBlock>{Children.toArray(children)[0]}</CodeBlock>;
  },
  a({ children, href }) {
    return (
      <a href={href} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  },
};

function AssistantAvatar() {
  return (
    <span className="assistant-avatar" aria-hidden="true">
      <Sparkles size={14} strokeWidth={2} />
    </span>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1600);
    } catch {
      setCopyStatus("failed");
      window.setTimeout(() => setCopyStatus("idle"), 2400);
    }
  }

  return (
    <article className="message-row assistant-row">
      <AssistantAvatar />
      <div className="assistant-message">
        <div className="assistant-name">Xander</div>
        <div className="markdown-content">
          <ReactMarkdown
            components={markdownComponents}
            rehypePlugins={[rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="message-actions">
          <button
            aria-label={
              copyStatus === "copied"
                ? "Response copied"
                : copyStatus === "failed"
                  ? "Could not copy response"
                  : "Copy response"
            }
            className="message-action"
            onClick={() => void copyAnswer()}
            type="button"
          >
            {copyStatus === "copied" ? (
              <Check size={15} />
            ) : (
              <Clipboard size={15} />
            )}
            <span>
              {copyStatus === "copied"
                ? "Copied"
                : copyStatus === "failed"
                  ? "Copy failed"
                  : "Copy"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ChatMessages({
  messages,
  isLoading,
  onSuggestion,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="welcome-icon">
          <Sparkles size={22} strokeWidth={1.8} />
        </div>
        <p className="welcome-eyebrow">A little help goes a long way</p>
        <h1 id="welcome-title">What can I help you with?</h1>
        <p className="welcome-description">
          Ask a question, share an idea, or tell me what you need.
        </p>
        <div className="suggestion-grid">
          {suggestions.map(({ icon: Icon, title, prompt }) => (
            <button
              className="suggestion-card"
              key={title}
              onClick={() => onSuggestion(prompt)}
              type="button"
            >
              <span className="suggestion-icon">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <span>{title}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message) =>
        message.role === "user" ? (
          <article className="message-row user-row" key={message.id}>
            <div className="user-message">{message.content}</div>
          </article>
        ) : (
          <AssistantMessage key={message.id} message={message} />
        ),
      )}
      {isLoading ? (
        <article className="message-row assistant-row thinking-row">
          <AssistantAvatar />
          <div className="assistant-message">
            <div className="assistant-name">Xander</div>
            <div className="thinking-indicator" role="status">
              <span className="thinking-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>Thinking</span>
            </div>
          </div>
        </article>
      ) : null}
      <div ref={bottomRef} />
    </div>
  );
}
