from fastapi import APIRouter
from .schema import chat_payload

ai_agent_router = APIRouter(prefix="/ai")
<<<<<<< HEAD
@ai_agent_router.post("/chat")
def initiate_chat(query:chat_payload):
=======

@ai_agent_router.post("/chat")
def initiate_chat(query: chat_payload):
>>>>>>> fd96dbd0b84e69ed02a7bd817072e7414bcc5eb6
    print(query.model_dump())
    return query

@ai_agent_router.get("/history")
def get_history(session_id: str):
<<<<<<< HEAD
    print("Session ID has been received")

    return f"Here is the chat for {session_id}Session ID"
=======
    print("Session Id has been recieved")

    # Todo
    # define service/ login

    return f"Here is the chat for {session_id} Session Id"
>>>>>>> fd96dbd0b84e69ed02a7bd817072e7414bcc5eb6
