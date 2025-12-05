import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '../components/animations/Particles';
import FuzzyText from '../components/animations/FuzzyText';
import StarBorder from '../components/animations/StarBorder';

interface Room {
    room_id: string;
    players: number;
    max_players: number;
    game_started: boolean;
}

const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [playerName, setPlayerName] = useState('');

    // Mock fetching rooms (replace with API call)
    useEffect(() => {
        fetch('/api/lobby/list')
            .then(res => res.json())
            .then(data => setRooms(data))
            .catch(err => console.error("Failed to fetch rooms", err));
    }, []);

    const handleCreateRoom = async () => {
        if (!playerName) return alert("Enter name first!");

        // 1. Register Player
        const authRes = await fetch('/api/auth/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playerName })
        });
        const authData = await authRes.json();
        const playerId = authData.player.id;
        localStorage.setItem('player_id', playerId);
        localStorage.setItem('player_name', playerName);

        // 2. Create Room
        const roomRes = await fetch('/api/lobby/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host_id: playerId })
        });
        const roomData = await roomRes.json();

        navigate(`/game/${roomData.room_id}`);
    };

    const handleJoinRoom = async (roomId: string) => {
        if (!playerName) return alert("Enter name first!");

        // 1. Register Player (if not already)
        let playerId = localStorage.getItem('player_id');
        if (!playerId) {
            const authRes = await fetch('/api/auth/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName })
            });
            const authData = await authRes.json();
            playerId = authData.player.id;
            localStorage.setItem('player_id', playerId!);
            localStorage.setItem('player_name', playerName);
        }

        navigate(`/game/${roomId}`);
    };

    return (
        <div className="relative w-full h-screen bg-base-charcoal text-white overflow-hidden flex flex-col items-center p-8">
            <Particles />

            <div className="z-10 w-full max-w-4xl flex flex-col gap-8">
                <header className="flex justify-between items-center border-b border-white/10 pb-6">
                    <FuzzyText className="text-4xl font-bold">LOBBY</FuzzyText>
                    <div className="flex gap-4 items-center">
                        <input
                            type="text"
                            placeholder="ENTER YOUR NAME"
                            className="bg-black/30 border border-neon-cyan/50 rounded-lg px-4 py-2 text-neon-cyan focus:outline-none focus:border-neon-cyan transition-colors"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                        <StarBorder
                            as="button"
                            className="bg-neon-cyan text-base-charcoal font-bold rounded-lg hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                            color="#00FFFF"
                            speed="3s"
                            onClick={handleCreateRoom}
                        >
                            <span className="px-6 py-2">CREATE ROOM</span>
                        </StarBorder>
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {rooms.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="col-span-full text-center py-20 text-gray-500 font-mono"
                            >
                                NO ACTIVE SIGNALS DETECTED. START A NEW FREQUENCY.
                            </motion.div>
                        ) : (
                            rooms.map((room) => (
                                <motion.div
                                    key={room.room_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-neon-orange/50 transition-colors group cursor-pointer relative overflow-hidden"
                                    onClick={() => handleJoinRoom(room.room_id)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/0 to-neon-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-bold font-mono tracking-wider">{room.room_id}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${room.game_started ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                            {room.game_started ? 'IN PROGRESS' : 'OPEN'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="text-gray-400 text-sm">
                                            PLAYERS
                                        </div>
                                        <div className="text-xl font-bold text-neon-orange">
                                            {room.players} / {room.max_players}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Lobby;
