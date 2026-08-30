import React from 'react';

export function FrenchFlag({ className = "w-7 h-7" }) {
  return (
    <svg className={`rounded-full overflow-hidden shrink-0 ${className}`} viewBox="0 0 3 2">
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#FFFFFF" />
      <rect x="2" width="1" height="2" fill="#ED2939" />
    </svg>
  );
}

export function UKFlag({ className = "w-7 h-7" }) {
  return (
    <svg className={`rounded-full overflow-hidden shrink-0 ${className}`} viewBox="0 0 60 30">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="8"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  );
}
