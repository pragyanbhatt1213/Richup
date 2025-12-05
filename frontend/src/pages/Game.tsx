import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import Particles from '../components/animations/Particles';
import FuzzyText from '../components/animations/FuzzyText';
import StarBorder from '../components/animations/StarBorder';
import Dice from '../components/animations/Dice';

const BOARD_SIZE = 800;
const TILE_WIDTH = BOARD_SIZE / 11; // 11 units per side (9 properties + 2 corners)

interface Property {
    id: number;
    name: string;
    price: number;
    rent: number;
    color: string;
    type: string;
}

const Game: React.FC = () => {
    const { roomId } = useParams();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<any>(null);
    const [boardConfig, setBoardConfig] = useState<Property[]>([]);
    const [gameLog, setGameLog] = useState<string[]>([]);
    const [isRolling, setIsRolling] = useState(false);
    const [diceValues, setDiceValues] = useState([1, 1]);

    // Animation State
    const playerPositionsRef = useRef<{ [key: string]: number }>({});
    const animationFrameRef = useRef<number>();

    const playerId = localStorage.getItem('player_id');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = window.location.port ? `:${8000}` : '';
    const { isConnected, lastMessage, sendMessage } = useWebSocket(
        roomId && playerId ? `${wsProtocol}//${wsHost}${wsPort}/ws/game/${roomId}/${playerId}` : null
    );

    // Fetch Board Config
    useEffect(() => {
        fetch('http://localhost:8000/api/game/config')
            .then(res => res.json())
            .then(data => setBoardConfig(data))
            .catch(err => console.error("Failed to fetch board config", err));
    }, []);

    // Handle WS Messages
    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.type === 'GAME_STARTED' || lastMessage.type === 'UPDATE_STATE') {
                setGameState(lastMessage.state);
                if (lastMessage.state.game_log) {
                    setGameLog(prev => [lastMessage.state.game_log, ...prev].slice(0, 5));
                }

                // Handle Dice Update
                if (lastMessage.state.last_roll) {
                    setDiceValues(lastMessage.state.last_roll);
                    setIsRolling(false);
                }
            }
        }
    }, [lastMessage]);

    // Animation Loop
    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas || boardConfig.length === 0) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear
            ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

            // Background
            ctx.fillStyle = '#0d0d0d';
            ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

            // Draw Tiles
            boardConfig.forEach((tile) => {
                let x = 0, y = 0, w = 0, h = 0;
                const id = tile.id;

                // Calculate position (Standard Monopoly Layout)
                if (id >= 0 && id < 10) { // Bottom (Right to Left)
                    x = BOARD_SIZE - (id * TILE_WIDTH) - TILE_WIDTH;
                    y = BOARD_SIZE - TILE_WIDTH;
                    w = TILE_WIDTH; h = TILE_WIDTH;
                } else if (id >= 10 && id < 20) { // Left (Bottom to Top)
                    x = 0;
                    y = BOARD_SIZE - ((id - 10) * TILE_WIDTH) - TILE_WIDTH;
                    w = TILE_WIDTH; h = TILE_WIDTH;
                } else if (id >= 20 && id < 30) { // Top (Left to Right)
                    x = (id - 20) * TILE_WIDTH;
                    y = 0;
                    w = TILE_WIDTH; h = TILE_WIDTH;
                } else if (id >= 30 && id < 40) { // Right (Top to Bottom)
                    x = BOARD_SIZE - TILE_WIDTH;
                    y = (id - 30) * TILE_WIDTH;
                    w = TILE_WIDTH; h = TILE_WIDTH;
                }

                // Draw Tile Border
                ctx.strokeStyle = '#333';
                ctx.strokeRect(x, y, w, h);

                // Draw Color Bar (if property)
                if (tile.type === 'PROPERTY' || tile.type === 'STATION' || tile.type === 'UTILITY') {
                    ctx.fillStyle = tile.color;
                    if (id < 10 || id >= 30) ctx.fillRect(x, y, w, 20); // Top bar
                    else ctx.fillRect(x, y, 20, h); // Side bar (simplified)
                }

                // Draw Ownership Marker
                if (gameState?.ownership && gameState.ownership[id]) {
                    const ownerId = gameState.ownership[id];
                    const owner = gameState.players[ownerId];
                    if (owner) {
                        ctx.fillStyle = owner.color;
                        ctx.beginPath();
                        ctx.arc(x + w / 2, y + h / 2, 5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });

            // Draw Players with Interpolation
            if (gameState && gameState.players) {
                Object.values(gameState.players).forEach((player: any, index) => {
                    const targetPos = player.position;
                    let currentPos = playerPositionsRef.current[player.id] ?? targetPos;

                    // Interpolate
                    const diff = targetPos - currentPos;

                    // Handle wrapping around board (39 -> 0)
                    if (Math.abs(diff) > 20) {
                        if (diff > 0) currentPos -= 0.5; // Wrap backwards (rare)
                        else currentPos += 0.5; // Wrap forwards

                        // Reset if crossed boundary visually
                        if (currentPos >= 40) currentPos = 0;
                        if (currentPos < 0) currentPos = 39;
                    } else {
                        if (Math.abs(diff) < 0.05) currentPos = targetPos;
                        else currentPos += diff * 0.1;
                    }

                    playerPositionsRef.current[player.id] = currentPos;

                    // Calculate coords based on interpolated position
                    const posIndex = Math.floor(currentPos);
                    const nextIndex = (posIndex + 1) % 40;
                    const progress = currentPos - posIndex;

                    const getCoords = (id: number) => {
                        let x = 0, y = 0;
                        if (id >= 0 && id < 10) { x = BOARD_SIZE - (id * TILE_WIDTH) - TILE_WIDTH / 2; y = BOARD_SIZE - TILE_WIDTH / 2; }
                        else if (id >= 10 && id < 20) { x = TILE_WIDTH / 2; y = BOARD_SIZE - ((id - 10) * TILE_WIDTH) - TILE_WIDTH / 2; }
                        else if (id >= 20 && id < 30) { x = (id - 20) * TILE_WIDTH + TILE_WIDTH / 2; y = TILE_WIDTH / 2; }
                        else if (id >= 30 && id < 40) { x = BOARD_SIZE - TILE_WIDTH / 2; y = (id - 30) * TILE_WIDTH + TILE_WIDTH / 2; }
                        return { x, y };
                    };

                    const p1 = getCoords(posIndex);
                    const p2 = getCoords(nextIndex);

                    // Linear interpolation between tile centers
                    let x = p1.x + (p2.x - p1.x) * progress;
                    let y = p1.y + (p2.y - p1.y) * progress;

                    // Offset slightly for multiple players
                    x += (index * 5) - 5;
                    y += (index * 5) - 5;

                    ctx.beginPath();
                    ctx.arc(x, y, 12, 0, Math.PI * 2);
                    ctx.fillStyle = player.color || '#FF6B00';
                    ctx.fill();
                    ctx.strokeStyle = '#FFF';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Glow
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = player.color;
                });
                ctx.shadowBlur = 0; // Reset
            }

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [gameState, boardConfig]);

    const handleRollDice = () => {
        setIsRolling(true);
        sendMessage({ type: 'ROLL_DICE' });
    };

    const handleBuyProperty = () => {
        sendMessage({ type: 'BUY_PROPERTY' });
    };

    const currentPlayer = gameState?.players[playerId || ''];
    const currentTile = boardConfig[currentPlayer?.position || 0];
    const canBuy = currentTile?.type === 'PROPERTY' &&
        !gameState?.ownership?.[currentTile.id] &&
        currentPlayer?.money >= currentTile?.price;

    return (
        <div className="w-full h-screen bg-base-charcoal flex items-center justify-center relative overflow-hidden">
            <Particles />

            {/* HUD - Top Left */}
            <div className="absolute top-8 left-8 z-20 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-neon-cyan/30">
                <FuzzyText className="text-2xl font-bold mb-2">ROOM: {roomId}</FuzzyText>
                <div className={`text-sm font-mono mb-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                    STATUS: {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </div>

                {currentPlayer && (
                    <div className="space-y-2">
                        <div className="text-neon-orange font-bold text-xl">
                            MONEY: ₹{currentPlayer.money}
                        </div>
                        <div className="text-gray-400 text-sm">
                            PROPERTIES: {currentPlayer.properties.length}
                        </div>
                    </div>
                )}
            </div>

            {/* Game Board */}
            <div className="relative z-10 p-2 border-4 border-neon-cyan/20 rounded-xl bg-black/80 shadow-[0_0_80px_rgba(0,255,255,0.15)]">
                <canvas
                    ref={canvasRef}
                    width={BOARD_SIZE}
                    height={BOARD_SIZE}
                    className="rounded-lg"
                />

                {/* Dice Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex gap-8">
                        <Dice value={diceValues[0]} rolling={isRolling} />
                        <Dice value={diceValues[1]} rolling={isRolling} />
                    </div>
                </div>
            </div>

            {/* Controls - Bottom Right */}
            <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-4 items-end">

                {/* Game Log */}
                <div className="w-80 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 mb-4">
                    <h3 className="text-neon-cyan font-bold mb-2 text-sm">GAME LOG</h3>
                    <div className="flex flex-col gap-1">
                        {gameLog.map((log, i) => (
                            <div key={i} className="text-xs text-gray-300 font-mono border-b border-white/5 pb-1 last:border-0">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    {canBuy && (
                        <StarBorder
                            as="button"
                            className="bg-green-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,255,0,0.5)] animate-pulse pointer-events-auto"
                            color="#00FF00"
                            speed="2s"
                            onClick={handleBuyProperty}
                        >
                            <span className="px-8 py-4">BUY {currentTile.name} (₹{currentTile.price})</span>
                        </StarBorder>
                    )}

                    <StarBorder
                        as="button"
                        className="bg-neon-orange text-base-charcoal font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,107,0,0.5)] pointer-events-auto"
                        color="#FF6B00"
                        speed="3s"
                        onClick={handleRollDice}
                    >
                        <span className="px-8 py-4">ROLL DICE</span>
                    </StarBorder>
                </div>
            </div>
        </div>
    );
};

export default Game;
