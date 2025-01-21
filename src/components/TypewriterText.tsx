"use client";
import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function TypewriterText({ text, delay = 50, className = "" }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <div className={`font-mono text-terminal-lime ${className}`}>
      {displayedText}
      <span className="text-6xl animate-cursor-blink ml-0.5 inline-block w-0.5 h-4 bg-terminal-lime"></span>
    </div>
  );
}