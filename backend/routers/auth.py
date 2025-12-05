from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from ..models.player import Player

router = APIRouter(prefix="/api/auth", tags=["auth"])

class JoinRequest(BaseModel):
    name: str

@router.post("/join")
async def join_game(request: JoinRequest):
    if not request.name:
        raise HTTPException(status_code=400, detail="Name is required")
    
    player_id = str(uuid.uuid4())
    player = Player(id=player_id, name=request.name)
    
    return {"player": player.dict(), "token": player_id} # Simple token for now
