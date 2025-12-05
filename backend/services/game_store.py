from typing import Dict
from ..models.room import Room
from ..database import db

# In-memory storage for active rooms
rooms: Dict[str, Room] = {}

async def save_room_snapshot(room: Room):
    if db.db is not None:
        await db.db.rooms.update_one(
            {"room_id": room.room_id},
            {"$set": room.dict()},
            upsert=True
        )

async def load_room(room_id: str) -> Room | None:
    if db.db is not None:
        data = await db.db.rooms.find_one({"room_id": room_id})
        if data:
            return Room(**data)
    return None

async def get_room(room_id: str) -> Room | None:
    if room_id in rooms:
        return rooms[room_id]
    
    # Try loading from DB
    room = await load_room(room_id)
    if room:
        rooms[room_id] = room
        return room
    return None

def create_room(room_id: str, host_id: str = None) -> Room:
    new_room = Room(room_id=room_id, host_id=host_id)
    rooms[room_id] = new_room
    return new_room

def list_rooms() -> Dict[str, Room]:
    return rooms
