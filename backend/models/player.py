from pydantic import BaseModel
from typing import List

class Player(BaseModel):
    id: str
    name: str
    position: int = 0
    color: str = "#FF6B00"
    money: int = 1500
    properties: List[int] = []
    in_jail: bool = False
