import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export default function Logo({ className = '', iconSize = 32, textSize = 'text-2xl' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Styled wordmark for OutStyl */}
      <span className={`font-display font-extrabold tracking-tighter ${textSize} whitespace-nowrap select-none`}>
        <span className="text-white">Out</span>
        <span className="text-[#F02D7D] filter drop-shadow-[0_0_6px_rgba(240,45,125,0.3)]">Styl</span>
      </span>
    </div>
  );
}
