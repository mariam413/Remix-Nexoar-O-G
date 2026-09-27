import React from 'react';

export interface NexoraLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'horizontal' | 'compact' | 'icon-only';
  theme?: 'auto' | 'light' | 'dark';
  showTagline?: boolean;
  subtitle?: string;
}

/**
 * Official NEXORA O&G Brand Logo Component
 * Single Source of Truth based on the official brand asset.
 * Features:
 * - 3D Ribbon 'N' symbol with Royal Blue left loop, inner oil droplet, and green leaf transition + right pillar
 * - Signature dual-color 'X' in "NEXORA" (Blue & Green intersecting strokes)
 * - "O&G" with Cyan-to-Green gradient bounded by rule lines
 * - Subline: "AI-POWERED CRITICAL MATERIALS & PROCUREMENT INTELLIGENCE"
 */
export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  theme = 'auto',
  showTagline,
  subtitle,
}) => {
  // Dimension tokens
  const dimensions = {
    xs: { icon: 24, text: 'text-sm', ogText: 'text-[10px]', tag: 'text-[7px]', gap: 'gap-2' },
    sm: { icon: 32, text: 'text-base', ogText: 'text-xs', tag: 'text-[8px]', gap: 'gap-2.5' },
    md: { icon: 42, text: 'text-xl', ogText: 'text-sm', tag: 'text-[9px]', gap: 'gap-3' },
    lg: { icon: 54, text: 'text-2xl', ogText: 'text-base', tag: 'text-[10px]', gap: 'gap-3.5' },
    xl: { icon: 72, text: 'text-3xl', ogText: 'text-xl', tag: 'text-xs', gap: 'gap-4' },
    hero: { icon: 96, text: 'text-4xl', ogText: 'text-2xl', tag: 'text-sm', gap: 'gap-5' },
  }[size];

  // Theme text styling
  const textColorClass =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-[#061A2E]'
      : 'text-[#061A2E] dark:text-white';

  const sublineColorClass =
    theme === 'dark'
      ? 'text-slate-300'
      : theme === 'light'
      ? 'text-[#0B2A4A]'
      : 'text-[#0B2A4A] dark:text-slate-300';

  // Render the Official NEXORA Mark (SVG)
  const renderIcon = (customSize?: number) => {
    const s = customSize || dimensions.icon;
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
        aria-label="NEXORA Official Symbol"
      >
        <defs>
          {/* Deep Navy to Vibrant Royal Blue gradient for left loop */}
          <linearGradient id="nexoraBlueRibbon" x1="20%" y1="90%" x2="80%" y2="10%">
            <stop offset="0%" stopColor="#061A2E" />
            <stop offset="35%" stopColor="#0B2A4A" />
            <stop offset="70%" stopColor="#0878C9" />
            <stop offset="100%" stopColor="#00AFC7" />
          </linearGradient>

          {/* Cyan to Royal Blue for inner droplet */}
          <linearGradient id="nexoraDroplet" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#00AFC7" />
            <stop offset="60%" stopColor="#0878C9" />
            <stop offset="100%" stopColor="#061A2E" />
          </linearGradient>

          {/* Royal Blue to Leaf Green transition fold */}
          <linearGradient id="nexoraFoldSweep" x1="10%" y1="20%" x2="90%" y2="80%">
            <stop offset="0%" stopColor="#0878C9" />
            <stop offset="45%" stopColor="#00AFC7" />
            <stop offset="75%" stopColor="#35C759" />
            <stop offset="100%" stopColor="#159447" />
          </linearGradient>

          {/* Emerald Green for right upright pillar */}
          <linearGradient id="nexoraRightPillar" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#35C759" />
            <stop offset="60%" stopColor="#1EB451" />
            <stop offset="100%" stopColor="#0E7535" />
          </linearGradient>

          {/* Soft shadow for depth under ribbon folds */}
          <filter id="ribbonShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#061A2E" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 1. RIGHT PILLAR (Back element of the N geometry) */}
        <path
          d="M98 28L122 18V130C122 135 117 139 112 139L98 132V28Z"
          fill="url(#nexoraRightPillar)"
        />

        {/* 2. INNER OIL / FLUID DROPLET nestled in the lower crook of the N */}
        <path
          d="M74 72C74 72 61 95 61 106C61 117.5 69.5 125 79.5 125C89.5 125 98 117.5 98 106C98 95 74 72 74 72Z"
          fill="url(#nexoraDroplet)"
          filter="url(#ribbonShadow)"
        />
        {/* Droplet Highlight Sheen */}
        <ellipse cx="73" cy="102" rx="4" ry="9" transform="rotate(-25 73 102)" fill="#FFFFFF" opacity="0.3" />

        {/* 3. LEFT MAIN ARCHING RIBBON (Front Blue Pillar & Arch) */}
        <path
          d="M38 126V42C38 30 50 20 64 24C78 28 88 42 76 66C66 86 52 82 52 108V126C52 130 45 133 41 130L38 126Z"
          fill="url(#nexoraBlueRibbon)"
        />

        {/* 4. DIAGONAL 3D FOLD SWEEPING INTO GREEN TAPERED LEAF TIP */}
        <path
          d="M58 24C78 22 104 44 116 66C128 88 139 104 148 109C134 114 112 104 96 84C82 66 68 44 58 24Z"
          fill="url(#nexoraFoldSweep)"
          filter="url(#ribbonShadow)"
        />
      </svg>
    );
  };

  // Render the official wordmark: "NEXORA" with the signature blue/green dual-stroke X
  const renderWordmark = () => (
    <div className={`font-black tracking-tight ${dimensions.text} ${textColorClass} flex items-center leading-none select-none font-sans`}>
      <span>NE</span>
      {/* Signature Dual-Color X */}
      <span className="relative inline-flex items-center justify-center mx-[0.5px]">
        {/* Backslash in Blue */}
        <span className="text-[#0878C9] font-black">X</span>
        {/* Overlay Green forward slash effect */}
        <span
          className="absolute inset-0 text-[#35C759] font-black pointer-events-none"
          style={{ clipPath: 'polygon(50% 0%, 100% 0%, 50% 100%, 0% 100%)' }}
        >
          X
        </span>
      </span>
      <span>ORA</span>
    </div>
  );

  // Render the "O&G" with flanked horizontal rule lines
  const renderOGBar = () => (
    <div className="flex items-center gap-1.5 w-full select-none my-0.5">
      {/* Left Teal Gradient Line */}
      <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent to-[#00AFC7]" />
      {/* O&G Text in Cyan-to-Green Gradient */}
      <span
        className={`font-black tracking-widest ${dimensions.ogText} bg-gradient-to-r from-[#00AFC7] via-[#0878C9] to-[#35C759] bg-clip-text text-transparent px-1 leading-none font-sans`}
      >
        O&amp;G
      </span>
      {/* Right Green Gradient Line */}
      <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#35C759] to-transparent" />
    </div>
  );

  // Render Tagline
  const renderTagline = () => (
    <p
      className={`${dimensions.tag} font-bold uppercase tracking-widest ${sublineColorClass} text-center leading-tight mt-0.5 select-none font-sans`}
    >
      {subtitle || 'AI-POWERED CRITICAL MATERIALS & PROCUREMENT INTELLIGENCE'}
    </p>
  );

  // --- VARIANT 1: ICON ONLY ---
  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  // --- VARIANT 2: COMPACT (Icon + NEXORA O&G side-by-side, no full tagline) ---
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center ${dimensions.gap} ${className}`}>
        {renderIcon()}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            {renderWordmark()}
            <span className="font-extrabold text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-[#00AFC7]/20 to-[#35C759]/20 text-[#0878C9] dark:text-[#35C759] border border-[#00AFC7]/30">
              O&amp;G
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // --- VARIANT 3: FULL (Stacked logo matching the official logo graphic exactly) ---
  if (variant === 'full') {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        {renderIcon(size === 'hero' ? 120 : size === 'xl' ? 96 : size === 'lg' ? 76 : 56)}
        <div className="flex flex-col items-center mt-2.5 max-w-[280px]">
          {renderWordmark()}
          {renderOGBar()}
          {(showTagline !== false) && renderTagline()}
        </div>
      </div>
    );
  }

  // --- VARIANT 4: HORIZONTAL (Default: Icon on left, stacked Wordmark + O&G Bar on right) ---
  return (
    <div className={`inline-flex items-center ${dimensions.gap} ${className}`}>
      {renderIcon()}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          {renderWordmark()}
          <span className="font-black text-[11px] tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-[#00AFC7]/15 to-[#35C759]/15 text-[#0878C9] dark:text-[#35C759] border border-[#00AFC7]/30">
            O&amp;G
          </span>
        </div>
        <p className={`${dimensions.tag} font-semibold text-slate-500 dark:text-slate-400 tracking-wider truncate max-w-[240px] sm:max-w-none`}>
          {subtitle || 'Critical Materials & Procurement Intelligence'}
        </p>
      </div>
    </div>
  );
};
