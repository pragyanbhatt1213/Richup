from pydantic import BaseModel
from typing import Dict, Optional
from .player import Player

class GameState(BaseModel):
    game_started: bool = False
    turn_player_id: Optional[str] = None
    ownership_map: Dict[int, str] = {} # Property ID -> Player ID

class Room(BaseModel):
    room_id: str
    host_id: Optional[str] = None
    players: Dict[str, Player] = {}
    state: GameState = GameState()
    max_players: int = 4
    
    class Config:
        arbitrary_types_allowed = True
