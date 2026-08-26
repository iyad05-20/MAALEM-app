import React from "react";
import { motion } from "framer-motion";

interface AnimatedZelligePatternProps {
  size?: number;
  color?: string;
  className?: string;
}

export const AnimatedZelligePattern: React.FC<AnimatedZelligePatternProps> = ({
  size = 48,
  color = "var(--accent-premium)",
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Star Geometries */}
      <motion.polygon
        points="14,4 36,4 46,14 46,36 36,46 14,46 4,36 4,14"
        stroke={color}
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0.2 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
      
      {/* Inner Rotated Squares */}
      <motion.rect
        x="15"
        y="15"
        width="20"
        height="20"
        stroke={color}
        strokeWidth="1.2"
        transform="rotate(45 25 25)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
      />

      {/* Central Zellige Diamond Accent */}
      <motion.polygon
        points="25,18 32,25 25,32 18,25"
        fill={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
    </svg>
  );
};
