const backendUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export async function forwardToBackend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    const upstream = await fetch(`${backendUrl}${path}`, {
      ...init,
      cache: "no-store",
    });
    const body = await upstream.text();
    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    return new Response(body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "The connection was refused.";

    return Response.json(
      {
        detail: `Could not reach the AI backend at ${backendUrl}. ${reason}`,
      },
      { status: 502 },
    );
  }
}
