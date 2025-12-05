from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from ..services import game_store
from ..models.room import Room
from ..models.player import Player

router = APIRouter(prefix="/api/lobby", tags=["lobby"])

class CreateRoomRequest(BaseModel):
    host_id: str

class JoinRoomRequest(BaseModel):
    player_id: str
    player_name: str

@router.post("/create")
async def create_room(request: CreateRoomRequest):
    room_id = str(uuid.uuid4())[:6].upper() # Short code
    room = game_store.create_room(room_id, host_id=request.host_id)
    return {"room_id": room_id, "room": room.dict()}

@router.post("/join")
async def join_room(request: JoinRoomRequest):
    room = await game_store.get_room(request.player_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if len(room.players) >= room.max_players:
        raise HTTPException(status_code=400, detail="Room is full")
    
    # Create player
    player = Player(id=request.player_id, name=request.player_name)
    room.players[request.player_id] = player
    
    # Save room
    await game_store.save_room_snapshot(room)
    
    return {"room_id": room.room_id, "player": player.dict()}

@router.get("/list")
async def list_rooms():
    active_rooms = game_store.list_rooms()
    # Return simplified list
    return [
        {
            "room_id": r.room_id, 
            "players": len(r.players), 
            "max_players": r.max_players,
            "game_started": r.state.game_started
        } 
        for r in active_rooms.values()
    ]
