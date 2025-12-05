from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, lobby, game
from .database import db

app = FastAPI(title="Rich-Up API")

# CORS Configuration
origins = ["*"]  # Allow all for dev

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close()

app.include_router(auth.router)
app.include_router(lobby.router)
app.include_router(game.router)

@app.get("/")
async def root():
    return {"message": "Rich-Up Backend is running"}
