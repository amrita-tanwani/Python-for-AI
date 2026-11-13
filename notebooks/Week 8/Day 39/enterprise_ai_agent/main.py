from fastapi import FastAPI
from core.database.sqlite import init_database
from modules.ai_agent.router import ai_agent_router

init_database()

app = FastAPI()

app.include_router(
    ai_agent_router,
    tags=["AI Module"]
)

@app.get("/", status_code=200)
async def root():
    return {
        "message": "You're at the Xander's Backend"
    }
