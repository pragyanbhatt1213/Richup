import React from 'react';
import { motion } from 'framer-motion';

interface FuzzyTextProps {
    children: React.ReactNode;
    className?: string;
}

const FuzzyText: React.FC<FuzzyTextProps> = ({ children, className = "" }) => {
    return (
        <motion.h1
            className={`relative ${className}`}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {children}
            <motion.span
                className="absolute inset-0 text-neon-cyan opacity-50"
                animate={{
                    x: [-2, 2, -1, 0],
                    opacity: [0.5, 0.2, 0.5]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    repeatType: "mirror"
                }}
                aria-hidden="true"
            >
                {children}
            </motion.span>
            <motion.span
                className="absolute inset-0 text-neon-orange opacity-50"
                animate={{
                    x: [2, -2, 1, 0],
                    opacity: [0.5, 0.2, 0.5]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    repeatType: "mirror"
                }}
                aria-hidden="true"
            >
                {children}
            </motion.span>
        </motion.h1>
    );
};

export default FuzzyText;
