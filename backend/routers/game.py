from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from ..services import game_store
from ..websocket.manager import manager
from ..models.player import Player
import random

router = APIRouter(tags=["game"])

from ..data.properties import get_property, BOARD_CONFIG

@router.get("/api/game/config")
async def get_board_config():
    return BOARD_CONFIG

@router.websocket("/ws/game/{room_id}/{player_id}")
async def game_websocket(websocket: WebSocket, room_id: str, player_id: str):
    room = await game_store.get_room(room_id)
    if not room:
        await websocket.close(code=4004, reason="Room not found")
        return

    await manager.connect(websocket, room_id)
    
    # Add player to room if not already (simple rejoin logic)
    if player_id not in room.players:
        # Try to get player info from request or create default
        player = Player(id=player_id, name=f"Player {player_id[:4]}")
        room.players[player_id] = player
        await game_store.save_room_snapshot(room)
    
    # Send initial state
    await websocket.send_json({
        "type": "ROOM_STATE",
        "state": {
            "room_id": room.room_id,
            "players": {pid: p.dict() for pid, p in room.players.items()},
            "ownership": room.state.ownership_map,
            "game_started": room.state.game_started
        }
    })
    
    # Notify others
    await manager.broadcast(room_id, {
        "type": "PLAYER_JOINED",
        "player_id": player_id,
        "players": {pid: p.dict() for pid, p in room.players.items()},
        "message": f"Player {room.players[player_id].name} joined"
    })

    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "ROLL_DICE":
                # Simple game logic: move player
                dice1 = random.randint(1, 6)
                dice2 = random.randint(1, 6)
                total = dice1 + dice2
                
                if player_id in room.players:
                    player = room.players[player_id]
                    
                    # Check if in Jail
                    if player.in_jail:
                        # Simplified Jail: Roll doubles to get out or wait 3 turns (not tracked yet)
                        if dice1 == dice2:
                            player.in_jail = False
                            message = f"Rolled doubles {dice1}-{dice2}! Released from Jail."
                        else:
                            message = f"Rolled {dice1}-{dice2}. Stuck in Jail."
                            # End turn immediately
                            await manager.broadcast(room_id, {
                                "type": "UPDATE_STATE",
                                "state": {
                                    "players": {pid: p.dict() for pid, p in room.players.items()},
                                    "last_roll": [dice1, dice2],
                                    "ownership": room.state.ownership_map,
                                    "game_log": message
                                }
                            })
                            continue

                    # Move Player
                    old_position = player.position
                    player.position = (player.position + total) % 40
                    
                    # Pass Go Logic
                    message = f"Rolled {total}."
                    if player.position < old_position:
                        player.money += 200
                        message += " Passed GO! Collected $200."

                    # Check Property Logic
                    prop = get_property(player.position)
                    message += f" Landed on {prop['name'] if prop else 'Unknown'}"
                    
                    # Go To Jail Tile
                    if prop and prop.get('name') == "GO TO JAIL":
                        player.position = 10 # Jail ID
                        player.in_jail = True
                        message += ". Sent to Jail!"
                    
                    elif prop and prop.get('type') == 'PROPERTY':
                        owner_id = room.state.ownership_map.get(prop['id'])
                        if owner_id and owner_id != player_id:
                            # Pay Rent
                            rent = prop.get('rent', 0)
                            if player.money >= rent:
                                player.money -= rent
                                room.players[owner_id].money += rent
                                message += f". Paid ${rent} rent to {room.players[owner_id].name}."
                            else:
                                # Bankruptcy logic (simplified)
                                transfer = player.money
                                player.money = 0
                                room.players[owner_id].money += transfer
                                message += f". Bankrupt! Paid ${transfer} to {room.players[owner_id].name}."
                    
                    # Persist state
                    await game_store.save_room_snapshot(room)

                    await manager.broadcast(room_id, {
                        "type": "UPDATE_STATE",
                        "state": {
                            "players": {pid: p.dict() for pid, p in room.players.items()},
                            "last_roll": [dice1, dice2],
                            "ownership": room.state.ownership_map,
                            "game_log": message
                        }
                    })

            elif data.get("type") == "BUY_PROPERTY":
                if player_id in room.players:
                    player = room.players[player_id]
                    prop = get_property(player.position)
                    
                    if prop and prop.get('type') == 'PROPERTY':
                        if prop['id'] not in room.state.ownership_map:
                            if player.money >= prop.get('price', 0):
                                player.money -= prop['price']
                                player.properties.append(prop['id'])
                                room.state.ownership_map[prop['id']] = player_id
                                
                                await game_store.save_room_snapshot(room)
                                
                                await manager.broadcast(room_id, {
                                    "type": "UPDATE_STATE",
                                    "state": {
                                        "players": {pid: p.dict() for pid, p in room.players.items()},
                                        "ownership": room.state.ownership_map,
                                        "game_log": f"{player.name} bought {prop['name']} for ${prop['price']}"
                                    }
                                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(room_id, {
            "type": "PLAYER_LEFT",
            "player_id": player_id
        })

@router.post("/api/game/start")
async def start_game(room_id: str):
    room = await game_store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room.state.game_started = True
    await game_store.save_room_snapshot(room)
    # Notify via WS
    await manager.broadcast(room_id, {
        "type": "GAME_STARTED",
        "state": {
            "players": {pid: p.dict() for pid, p in room.players.items()},
            "game_started": True
        }
    })
    return {"status": "started"}
