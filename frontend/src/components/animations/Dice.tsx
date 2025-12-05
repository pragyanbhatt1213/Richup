import React, { useEffect, useState } from 'react';
import './Dice.css';

interface DiceProps {
    value: number;
    rolling: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, rolling }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (rolling) {
            // Spin wildly while rolling
            const interval = setInterval(() => {
                setRotation({
                    x: Math.random() * 720,
                    y: Math.random() * 720
                });
            }, 100);
            return () => clearInterval(interval);
        } else {
            // Land on the correct face
            // Standard dice face rotations
            const rotations: { [key: number]: { x: number, y: number } } = {
                1: { x: 0, y: 0 },
                2: { x: 0, y: -90 },
                3: { x: 0, y: -180 },
                4: { x: 0, y: 90 },
                5: { x: -90, y: 0 },
                6: { x: 90, y: 0 }
            };

            // Add multiple full rotations for effect
            const target = rotations[value] || { x: 0, y: 0 };
            setRotation({
                x: target.x + 720,
                y: target.y + 720
            });
        }
    }, [value, rolling]);

    return (
        <div className="scene">
            <div
                className="cube"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                }}
            >
                <div className="cube__face cube__face--1">1</div>
                <div className="cube__face cube__face--2">2</div>
                <div className="cube__face cube__face--3">3</div>
                <div className="cube__face cube__face--4">4</div>
                <div className="cube__face cube__face--5">5</div>
                <div className="cube__face cube__face--6">6</div>
            </div>
        </div>
    );
};

export default Dice;
