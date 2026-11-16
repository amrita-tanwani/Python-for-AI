import { forwardToBackend } from "@/lib/backend-proxy";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.text();

  return forwardToBackend("/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
