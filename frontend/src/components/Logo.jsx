import React from 'react';

export default function Logo({ size = "md", className = "" }) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${currentSize} ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-[0_0_12px_rgba(255,42,133,0.4)]"
      >
        <defs>
          <linearGradient id="logoBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2a85"></stop>
            <stop offset="50%" stopColor="#a855f7"></stop>
            <stop offset="100%" stopColor="#00f0ff"></stop>
          </linearGradient>
          <filter id="neonGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"></feGaussianBlur>
            <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
          </filter>
        </defs>
        <rect 
          x="6" 
          y="6" 
          width="88" 
          height="88" 
          rx="24" 
          ry="24" 
          fill="#0c0915" 
          stroke="url(#logoBorderGradient)" 
          strokeWidth="6"
        ></rect>
        <path 
          d="M50 74 C31 59 21 44 21 34 C21 23 29 17 38 17 C45 17 48 21 50 24 C52 21 55 17 62 17 C71 17 79 23 79 34 C79 44 69 59 50 74 Z" 
          fill="none" 
          stroke="#ff2a85" 
          strokeWidth="5.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#neonGlowEffect)"
        ></path>
      </svg>
    </div>
  );
}
