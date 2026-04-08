import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ─── Variant definitions ─── */
const variants = {
  /*
   * PRIMARY — Deep teal with layered glow + animated shimmer
   */
  primary: {
    base: 'text-white font-bold rounded-2xl relative overflow-hidden select-none cursor-pointer',
    bg: 'bg-gradient-to-br from-[#0F766E] via-[#0d9488] to-[#0b5b55]',
    shadow: 'shadow-[0_6px_22px_-4px_rgba(15,118,110,0.55),_0_2px_6px_-2px_rgba(15,118,110,0.3)]',
    hoverShadow: 'hover:shadow-[0_12px_36px_-6px_rgba(15,118,110,0.65),_0_4px_12px_-2px_rgba(15,118,110,0.4)]',
    border: 'border border-white/10',
    focus: 'focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2',
  },
  /*
   * SECONDARY — White with teal tint border + hover fill
   */
  secondary: {
    base: 'text-brand font-bold rounded-2xl relative overflow-hidden select-none cursor-pointer bg-white',
    bg: '',
    shadow: 'shadow-[0_4px_14px_-4px_rgba(15,118,110,0.18),_0_1px_4px_rgba(0,0,0,0.06)]',
    hoverShadow: 'hover:shadow-[0_10px_28px_-6px_rgba(15,118,110,0.25),_0_3px_8px_rgba(0,0,0,0.06)]',
    border: 'border border-brand/20 hover:border-brand/40',
    focus: 'focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2',
  },
  /*
   * GHOST — Transparent with teal text + subtle bg on hover
   */
  ghost: {
    base: 'text-brand font-semibold rounded-xl relative overflow-hidden select-none cursor-pointer bg-transparent',
    bg: '',
    shadow: '',
    hoverShadow: '',
    border: '',
    focus: 'focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-1',
  },
  /*
   * OUTLINE — Teal border + fills on hover
   */
  outline: {
    base: 'text-brand font-bold rounded-2xl relative overflow-hidden select-none cursor-pointer bg-transparent',
    bg: '',
    shadow: 'shadow-[0_2px_10px_-4px_rgba(15,118,110,0.2)]',
    hoverShadow: 'hover:shadow-[0_8px_24px_-4px_rgba(15,118,110,0.35)]',
    border: 'border-2 border-brand hover:text-white',
    focus: 'focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2',
  },
  /*
   * WHITE — Glass-style for placement on dark/teal backgrounds
   */
  white: {
    base: 'text-white font-bold rounded-2xl relative overflow-hidden select-none cursor-pointer backdrop-blur-sm',
    bg: 'bg-white/12',
    shadow: 'shadow-[0_4px_16px_-4px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.2)]',
    hoverShadow: 'hover:shadow-[0_10px_32px_-6px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.25)]',
    border: 'border border-white/25 hover:border-white/45',
    focus: 'focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2',
  },
};

const sizes = {
  xs: 'px-3.5 py-1.5 text-xs gap-1.5',
  sm: 'px-5 py-2.5 text-sm gap-2',
  md: 'px-7 py-3 text-sm gap-2',
  lg: 'px-9 py-3.5 text-base gap-2.5',
  xl: 'px-11 py-4 text-base gap-3',
};

/* ─── Shimmer overlay (moves on hover via CSS group) ─── */
function Shimmer() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
      style={{
        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
        skewX: '-12deg',
      }}
    />
  );
}

/* ─── Outline fill overlay (fills from bottom on hover) ─── */
function OutlineFill() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-brand rounded-xl"
    />
  );
}

/* ─── Ghost hover overlay ─── */
function GhostHover() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 bg-brand/8 rounded-xl"
    />
  );
}

/* ─── Motion config ─── */
const motionCfg = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
};

/* ─── Main Button component ─── */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  href,
  type = 'button',
  tooltip,
  icon,
  loading = false,
  disabled = false,
  onClick,
  ...props
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const v = variants[variant];

  /* Build class string */
  const cls = cn(
    /* layout */
    'inline-flex items-center justify-center transition-all duration-300 outline-none',
    /* variant */
    v.base,
    v.bg,
    v.shadow,
    v.hoverShadow,
    v.border,
    v.focus,
    /* size */
    sizes[size],
    /* state */
    (disabled || loading) && 'opacity-50 pointer-events-none',
    className
  );

  /* Inner content */
  const inner = (
    <>
      {/* Overlays per variant */}
      {(variant === 'primary' || variant === 'white') && <Shimmer />}
      {variant === 'outline' && <OutlineFill />}
      {variant === 'ghost' && <GhostHover />}

      {/* Spinner */}
      {loading && (
        <svg
          className="animate-spin w-4 h-4 shrink-0 relative z-10"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}

      {/* Icon */}
      {icon && !loading && <span className="shrink-0 relative z-10">{icon}</span>}

      {/* Label */}
      <span className="relative z-10">{children}</span>
    </>
  );

  /* Render element */
  let element;
  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel');
    element = isExternal ? (
      <motion.a href={href} className={cn(cls, 'group')} onClick={onClick} {...motionCfg} {...props}>
        {inner}
      </motion.a>
    ) : (
      <motion.div className="inline-flex" {...motionCfg}>
        <Link to={href} className={cn(cls, 'group', 'w-full')} onClick={onClick} {...props}>
          {inner}
        </Link>
      </motion.div>
    );
  } else {
    element = (
      <motion.button
        type={type}
        className={cn(cls, 'group')}
        disabled={disabled || loading}
        onClick={onClick}
        {...motionCfg}
        {...props}
      >
        {inner}
      </motion.button>
    );
  }

  /* Tooltip wrapper */
  if (!tooltip) return element;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      {element}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[70] pointer-events-none"
          >
            <div
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {tooltip}
            </div>
            {/* Arrow */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2"
              style={{
                width: 0, height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1f2937',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
