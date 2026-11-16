import type {
  ChatRequest,
  ChatResponse,
  HistoryResponse,
} from "@/lib/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readResponse(response: Response): Promise<unknown> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      response.ok
        ? "The server returned an unreadable response."
        : `The request failed with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    const detail =
      isRecord(payload) && typeof payload.detail === "string"
        ? payload.detail
        : `The request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  return payload;
}

export async function sendChatMessage(
  request: ChatRequest,
): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const payload = await readResponse(response);

  if (
    !isRecord(payload) ||
    typeof payload.session_id !== "string" ||
    typeof payload.answer !== "string"
  ) {
    throw new Error("The chat service returned an unexpected response.");
  }

  return { session_id: payload.session_id, answer: payload.answer };
}

export async function getChatHistory(
  sessionId: string,
): Promise<HistoryResponse> {
  const params = new URLSearchParams({ session_id: sessionId });
  const response = await fetch(`/api/history?${params.toString()}`, {
    cache: "no-store",
  });
  const payload = await readResponse(response);

  if (
    !isRecord(payload) ||
    typeof payload.session_id !== "string" ||
    !Array.isArray(payload.messages) ||
    !payload.messages.every(
      (message) =>
        isRecord(message) &&
        (message.role === "user" || message.role === "ai") &&
        typeof message.content === "string",
    )
  ) {
    throw new Error("The history service returned an unexpected response.");
  }

  return {
    session_id: payload.session_id,
    messages: payload.messages,
  };
}
