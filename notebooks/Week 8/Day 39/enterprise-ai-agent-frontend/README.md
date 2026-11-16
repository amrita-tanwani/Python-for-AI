# Xander AI chat

A responsive Next.js chat interface for the existing FastAPI and LangGraph agent.

## Run locally

1. Start the FastAPI project in `Week 8/Day 39/enterprise_ai_agent` on port `8000`.
2. In this directory, copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_API_URL` if the backend is running at a different address.
3. Install dependencies and start the frontend:

   ```powershell
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The browser calls same-origin Next.js route handlers, which forward requests to FastAPI. This avoids requiring browser-to-backend CORS configuration. The proxy uses the existing API contracts:

- `POST /ai/chat` with `{ "query": "...", "session_id": "..." }`
- `GET /ai/history?session_id=...`

Conversation IDs and sidebar titles are stored in browser local storage. Message history remains in the backend and is retrieved when a saved conversation is opened. The current backend does not expose a conversation-list endpoint, so only conversations created in this browser appear in the sidebar.

The backend returns completed answers rather than a stream, so the interface shows a thinking state while each request is running.
