import React from 'react';

interface LutherRoseIconProps {
  className?: string;
  size?: number;
}

export const LutherRoseIcon: React.FC<LutherRoseIconProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="256" cy="256" r="240" fill="#1e3a5f" />
      {/* Golden outer ring */}
      <circle cx="256" cy="256" r="220" stroke="#f59e0b" strokeWidth="12" fill="none" opacity="0.9" />
      <circle cx="256" cy="256" r="185" fill="#3b82f6" fillOpacity="0.25" />
      {/* White Rose */}
      <g transform="translate(256, 256)">
        <path
          d="M 0,-130 C 40,-130 65,-90 40,-55 C 80,-85 120,-60 115,-15 C 150,-25 165,20 130,50 C 150,90 115,130 75,115 C 80,155 35,170 0,135 C -35,170 -80,155 -75,115 C -115,130 -150,90 -130,50 C -165,20 -150,-25 -115,-15 C -120,-60 -80,-85 -40,-55 C -65,-90 -40,-130 0,-130 Z"
          fill="#ffffff"
        />
        {/* Red Heart */}
        <path
          d="M 0,55 C -55,15 -75,-30 -35,-55 C -10,-70 0,-35 0,-25 C 0,-35 10,-70 35,-55 C 75,-30 55,15 0,55 Z"
          fill="#dc2626"
        />
        {/* Black Cross */}
        <path
          d="M -7,-45 H 7 V -20 H 25 V -10 H 7 V 30 H -7 V -10 H -25 V -20 H -7 Z"
          fill="#18181b"
        />
      </g>
    </svg>
  );
};
