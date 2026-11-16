import { forwardToBackend } from "@/lib/backend-proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return Response.json(
      { detail: "A session_id query parameter is required." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ session_id: sessionId });
  return forwardToBackend(`/ai/history?${params.toString()}`);
}
