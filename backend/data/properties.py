from typing import List, Dict, Optional
from pydantic import BaseModel

class PropertyData(BaseModel):
    id: int
    name: str
    price: int
    rent: int
    color: str
    type: str = "PROPERTY" # PROPERTY, CHEST, CHANCE, TAX, CORNER

# Futuristic Indian Cities & Locations
BOARD_CONFIG: List[PropertyData] = [
    {"id": 0, "name": "START", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CORNER"},
    {"id": 1, "name": "Dharavi Slums", "price": 60, "rent": 2, "color": "#8B4513", "type": "PROPERTY"},
    {"id": 2, "name": "COMMUNITY CHEST", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CHEST"},
    {"id": 3, "name": "Mumbai Chawl", "price": 60, "rent": 4, "color": "#8B4513", "type": "PROPERTY"},
    {"id": 4, "name": "INCOME TAX", "price": 0, "rent": 200, "color": "#FFFFFF", "type": "TAX"},
    {"id": 5, "name": "CST Station", "price": 200, "rent": 25, "color": "#000000", "type": "STATION"},
    {"id": 6, "name": "Jaipur Pink City", "price": 100, "rent": 6, "color": "#FF69B4", "type": "PROPERTY"}, # Keeping name but color will be mapped to allowed palette
    {"id": 7, "name": "CHANCE", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CHANCE"},
    {"id": 8, "name": "Udaipur Lake", "price": 100, "rent": 6, "color": "#FF69B4", "type": "PROPERTY"},
    {"id": 9, "name": "Jaisalmer Fort", "price": 120, "rent": 8, "color": "#FF69B4", "type": "PROPERTY"},
    {"id": 10, "name": "JAIL", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CORNER"},
    {"id": 11, "name": "Kolkata Howrah", "price": 140, "rent": 10, "color": "#FF00FF", "type": "PROPERTY"},
    {"id": 12, "name": "ELECTRIC COMPANY", "price": 150, "rent": 0, "color": "#FFFFFF", "type": "UTILITY"},
    {"id": 13, "name": "Victoria Memorial", "price": 140, "rent": 10, "color": "#FF00FF", "type": "PROPERTY"},
    {"id": 14, "name": "Eden Gardens", "price": 160, "rent": 12, "color": "#FF00FF", "type": "PROPERTY"},
    {"id": 15, "name": "Chennai Central", "price": 200, "rent": 25, "color": "#000000", "type": "STATION"},
    {"id": 16, "name": "Hyderabad Cyber", "price": 180, "rent": 14, "color": "#FFA500", "type": "PROPERTY"},
    {"id": 17, "name": "COMMUNITY CHEST", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CHEST"},
    {"id": 18, "name": "Charminar", "price": 180, "rent": 14, "color": "#FFA500", "type": "PROPERTY"},
    {"id": 19, "name": "Ramoji Film City", "price": 200, "rent": 16, "color": "#FFA500", "type": "PROPERTY"},
    {"id": 20, "name": "FREE PARKING", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CORNER"},
    {"id": 21, "name": "Bangalore Tech", "price": 220, "rent": 18, "color": "#FF0000", "type": "PROPERTY"},
    {"id": 22, "name": "CHANCE", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CHANCE"},
    {"id": 23, "name": "Indiranagar", "price": 220, "rent": 18, "color": "#FF0000", "type": "PROPERTY"},
    {"id": 24, "name": "Electronic City", "price": 240, "rent": 20, "color": "#FF0000", "type": "PROPERTY"},
    {"id": 25, "name": "New Delhi Station", "price": 200, "rent": 25, "color": "#000000", "type": "STATION"},
    {"id": 26, "name": "Connaught Place", "price": 260, "rent": 22, "color": "#FFFF00", "type": "PROPERTY"},
    {"id": 27, "name": "India Gate", "price": 260, "rent": 22, "color": "#FFFF00", "type": "PROPERTY"},
    {"id": 28, "name": "WATER WORKS", "price": 150, "rent": 0, "color": "#FFFFFF", "type": "UTILITY"},
    {"id": 29, "name": "Rashtrapati Bhavan", "price": 280, "rent": 24, "color": "#FFFF00", "type": "PROPERTY"},
    {"id": 30, "name": "GO TO JAIL", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CORNER"},
    {"id": 31, "name": "Pune IT Park", "price": 300, "rent": 26, "color": "#008000", "type": "PROPERTY"},
    {"id": 32, "name": "Koregaon Park", "price": 300, "rent": 26, "color": "#008000", "type": "PROPERTY"},
    {"id": 33, "name": "COMMUNITY CHEST", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CHEST"},
    {"id": 34, "name": "Lavasa", "price": 320, "rent": 28, "color": "#008000", "type": "PROPERTY"},
    {"id": 35, "name": "Metro Station", "price": 200, "rent": 25, "color": "#000000", "type": "STATION"},
    {"id": 36, "name": "CHANCE", "price": 0, "rent": 0, "color": "#FFFFFF", "type": "CHANCE"},
    {"id": 37, "name": "Gift City Gujarat", "price": 350, "rent": 35, "color": "#0000FF", "type": "PROPERTY"},
    {"id": 38, "name": "SUPER TAX", "price": 0, "rent": 100, "color": "#FFFFFF", "type": "TAX"},
    {"id": 39, "name": "Antilia", "price": 400, "rent": 50, "color": "#0000FF", "type": "PROPERTY"}
]

# Helper to get property by ID
def get_property(tile_id: int) -> Optional[dict]:
    if 0 <= tile_id < len(BOARD_CONFIG):
        return BOARD_CONFIG[tile_id]
    return None
