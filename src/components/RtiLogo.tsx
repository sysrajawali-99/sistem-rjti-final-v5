import React from 'react';

interface RtiLogoProps {
  variant?: 'symbol' | 'full' | 'horizontal';
  className?: string;
  size?: number | string;
  theme?: 'dark' | 'light' | 'auto';
  showText?: boolean;
}

/**
 * Official Logo Component for PT. Rajawali Talenta Indonesia
 * Faithfully matches the uploaded high-resolution vector emblem:
 * Soaring Eagle with deep blue upper wing & head, golden-yellow feathers,
 * crimson-red feathers, and vibrant green feathers.
 * Tightly cropped viewBox to fill the frame completely.
 */
export const RtiLogo: React.FC<RtiLogoProps> = ({
  variant = 'symbol',
  className = '',
  size = 48,
  theme = 'auto',
  showText = false
}) => {
  const isHorizontal = variant === 'horizontal';

  // SVG Emblem Symbol (Tightly cropped viewBox to fill container frame cleanly)
  const Emblem = ({ width = '100%', height = '100%' }: { width?: number | string; height?: number | string }) => (
    <svg
      viewBox="155 130 185 178"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Deep Sapphire Blue */}
        <linearGradient id="rtiBlue" x1="165" y1="135" x2="335" y2="205" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#084282" />
          <stop offset="60%" stopColor="#0b5299" />
          <stop offset="100%" stopColor="#1162af" />
        </linearGradient>

        {/* Golden Yellow */}
        <linearGradient id="rtiYellow1" x1="215" y1="190" x2="330" y2="235" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5bb1b" />
          <stop offset="100%" stopColor="#ebb00f" />
        </linearGradient>
        <linearGradient id="rtiYellow2" x1="220" y1="225" x2="295" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fac62b" />
          <stop offset="100%" stopColor="#e5a80a" />
        </linearGradient>

        {/* Crimson Red */}
        <linearGradient id="rtiRed1" x1="215" y1="240" x2="245" y2="305" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ea2925" />
          <stop offset="100%" stopColor="#c81717" />
        </linearGradient>
        <linearGradient id="rtiRed2" x1="180" y1="250" x2="220" y2="290" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f43a34" />
          <stop offset="100%" stopColor="#d61f1c" />
        </linearGradient>

        {/* Emerald Green */}
        <linearGradient id="rtiGreen1" x1="160" y1="215" x2="205" y2="255" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00a651" />
          <stop offset="100%" stopColor="#008c43" />
        </linearGradient>
        <linearGradient id="rtiGreen2" x1="160" y1="240" x2="195" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#02ba5d" />
          <stop offset="100%" stopColor="#009c4d" />
        </linearGradient>
      </defs>

      {/* EAGLE HEAD & UPPER BLUE WING */}
      {/* Eagle Head & Beak Contour */}
      <path
        d="M166 193 C175 180 190 167 212 166 L205 198 L166 193 Z"
        fill="#053366"
      />
      <path
        d="M166 193 L212 166 L208 198 L166 193 Z"
        fill="#084282"
      />
      {/* Top Blue Wing Polygon */}
      <path
        d="M208 198 L212 166 L334 133 L260 200 L208 198 Z"
        fill="url(#rtiBlue)"
      />

      {/* GOLDEN YELLOW FEATHERS */}
      {/* Feather 1 (Top Yellow) */}
      <path
        d="M218 196 L262 196 L332 218 L266 237 L218 206 Z"
        fill="url(#rtiYellow1)"
      />
      {/* Feather 2 (Middle-Bottom Yellow) */}
      <path
        d="M228 226 L266 237 L293 282 L245 262 L228 226 Z"
        fill="url(#rtiYellow2)"
      />

      {/* CRIMSON RED FEATHERS */}
      {/* Feather 3 (Right Red) */}
      <path
        d="M220 238 L245 262 L237 304 L215 270 L220 238 Z"
        fill="url(#rtiRed1)"
      />
      {/* Feather 4 (Left Red) */}
      <path
        d="M183 248 L215 270 L184 286 L195 258 L183 248 Z"
        fill="url(#rtiRed2)"
      />

      {/* EMERALD GREEN FEATHERS */}
      {/* Feather 5 (Bottom Green) */}
      <path
        d="M159 253 L183 248 L201 240 L177 266 L159 253 Z"
        fill="url(#rtiGreen2)"
      />
      {/* Feather 6 (Top Green) */}
      <path
        d="M162 216 L195 216 L205 228 L166 236 L162 216 Z"
        fill="url(#rtiGreen1)"
      />
    </svg>
  );

  if (variant === 'symbol') {
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <Emblem width="100%" height="100%" />
      </div>
    );
  }

  if (isHorizontal) {
    return (
      <div className={`inline-flex items-center gap-3.5 ${className}`}>
        <div style={{ width: size, height: size }} className="shrink-0 flex items-center justify-center">
          <Emblem width="100%" height="100%" />
        </div>
        <div className="flex flex-col text-left">
          <span 
            className={`font-black tracking-tight uppercase font-sans text-lg sm:text-xl leading-none ${
              theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-slate-950' : 'text-slate-900 dark:text-white'
            }`}
            style={{ letterSpacing: '-0.02em', fontWeight: 900 }}
          >
            RAJAWALI
          </span>
          <span 
            className={`text-[10px] sm:text-xs font-black uppercase font-sans tracking-widest mt-1 ${
              theme === 'dark' ? 'text-amber-400' : theme === 'light' ? 'text-slate-700' : 'text-amber-600 dark:text-amber-400'
            }`}
            style={{ letterSpacing: '0.24em' }}
          >
            TALENTA INDONESIA
          </span>
        </div>
      </div>
    );
  }

  // Full stacked variant
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div style={{ width: size, height: size }} className="flex items-center justify-center">
        <Emblem width="100%" height="100%" />
      </div>
      <div className="mt-2.5 flex flex-col items-center">
        <span 
          className={`font-black tracking-tight uppercase font-sans text-xl sm:text-2xl leading-none ${
            theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-slate-950' : 'text-slate-900 dark:text-white'
          }`}
          style={{ letterSpacing: '-0.02em', fontWeight: 900 }}
        >
          RAJAWALI
        </span>
        <span 
          className={`text-[11px] sm:text-xs font-black uppercase font-sans tracking-widest mt-1.5 ${
            theme === 'dark' ? 'text-slate-300' : theme === 'light' ? 'text-slate-700' : 'text-slate-600 dark:text-slate-300'
          }`}
          style={{ letterSpacing: '0.28em' }}
        >
          TALENTA INDONESIA
        </span>
      </div>
    </div>
  );
};
