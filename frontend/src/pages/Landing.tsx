import React from 'react';
import { useNavigate } from 'react-router-dom';
import FuzzyText from '../components/animations/FuzzyText';
import Particles from '../components/animations/Particles';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-base-charcoal">
            <Particles />

            <div className="z-10 flex flex-col items-center gap-12">
                <FuzzyText className="text-6xl md:text-8xl font-bold text-white tracking-tighter">
                    RICH-UP: INDIA
                </FuzzyText>

                <div className="flex flex-col md:flex-row gap-6">
                    <button
                        onClick={() => navigate('/lobby')}
                        className="px-8 py-4 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded-2xl text-xl font-bold backdrop-blur-sm hover:bg-neon-cyan hover:text-base-charcoal transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]"
                    >
                        PLAY NOW
                    </button>

                    <button
                        onClick={() => navigate('/lobby')}
                        className="px-8 py-4 bg-neon-orange/10 border border-neon-orange text-neon-orange rounded-2xl text-xl font-bold backdrop-blur-sm hover:bg-neon-orange hover:text-base-charcoal transition-all duration-300 shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_40px_rgba(255,107,0,0.6)]"
                    >
                        JOIN ROOM
                    </button>
                </div>
            </div>

            <div className="absolute bottom-8 text-gray-500 text-sm font-mono">
                FUTURISTIC ECONOMIC STRATEGY
            </div>
        </div>
    );
};

export default Landing;
