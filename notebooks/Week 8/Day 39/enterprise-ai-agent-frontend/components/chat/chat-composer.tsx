"use client";

import { ArrowUp } from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
} from "react";

interface ChatComposerProps {
  value: string;
  disabled: boolean;
  isSending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function ChatComposer({
  value,
  disabled,
  isSending,
  onChange,
  onSubmit,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-input">
          Message Xander
        </label>
        <textarea
          autoComplete="off"
          disabled={disabled}
          id="chat-input"
          maxLength={12000}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Xander…"
          ref={textareaRef}
          rows={1}
          value={value}
        />
        <div className="composer-controls">
          <span className="composer-hint">Shift + Enter for a new line</span>
          <div className="composer-spacer" />
          <button
            aria-label={isSending ? "Sending message" : "Send message"}
            className="send-button"
            disabled={disabled || !value.trim() || isSending}
            type="submit"
          >
            <ArrowUp size={18} strokeWidth={2.2} />
          </button>
        </div>
      </form>
      <p className="composer-note">
        Xander can make mistakes. Check important information.
      </p>
    </div>
  );
}
