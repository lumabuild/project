"use client";
import { useState, useEffect } from "react";
import TypewriterText from "./TypewriterText";

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
}

const StatBox = ({ label, value, color = "text-terminal-lime" }: StatBoxProps) => (
  <div className="border border-terminal-lime/30 p-3 rounded-sm bg-terminal-black/30">
    <div className="text-terminal-lime/70 text-sm mb-1">
      {label}
    </div>
    <div className={`${color} text-lg font-mono`}>
      {value.toString()}
    </div>
  </div>
);

const formatVolume = (num: number) => {
  return `$${(num / 1000000000).toFixed(2)}B`;
};

export const DashboardStats = () => {
  const [rugs, setRugs] = useState(72);
  const [volume, setVolume] = useState(2400000000);
  const [graduations, setGraduations] = useState(14);
  const [activePumps, setActivePumps] = useState(23);

  useEffect(() => {
    // Fast updates for rugs (every 2 seconds)
    const rugsInterval = setInterval(() => {
      setRugs(prev => {
        const newValue = prev + Math.floor(Math.random() * 21) - 10; // ±10
        return Math.max(62, Math.min(82, newValue)); // Keeps within ±10 of 72
      });
    }, 2000);

    // Medium updates for volume (every 3 seconds)
    const volumeInterval = setInterval(() => {
      setVolume(prev => {
        const change = (Math.random() * 20000000 - 10000000); // ±10M (0.01B increments)
        const newValue = prev + change;
        return Math.max(2000000000, Math.min(2800000000, newValue)); // Keeps within ±0.4B of 2.4B
      });
    }, 3000);

    // Updates for active pumps (every 5 seconds)
    const pumpsInterval = setInterval(() => {
      setActivePumps(prev => {
        const newValue = prev + Math.floor(Math.random() * 11) - 5; // ±5
        return Math.max(18, Math.min(28, newValue)); // Keeps within ±5 of 23
      });
    }, 5000);

    // Slow updates for graduations (every 8 seconds)
    const graduationsInterval = setInterval(() => {
      setGraduations(prev => {
        const newValue = prev + Math.floor(Math.random() * 11) - 5; // ±5
        return Math.max(9, Math.min(19, newValue)); // Keeps within ±5 of 14
      });
    }, 8000);

    return () => {
      clearInterval(rugsInterval);
      clearInterval(volumeInterval);
      clearInterval(pumpsInterval);
      clearInterval(graduationsInterval);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatBox label="General Sentiment" value="Bullish" />
      <StatBox label="Coins Graduating/10m" value={graduations} />
      <StatBox label="Active Pumps" value={activePumps} />
      <StatBox label="24h Volume" value={formatVolume(volume)} />
      <StatBox label="Rugs/10m" value={rugs} color="text-red-500" />
    </div>
  );
}; 