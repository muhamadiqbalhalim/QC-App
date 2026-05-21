import React, { memo } from 'react';

function MetaCards({
  icon: Icon,
  label,
  value,
  mono = false,
  darkMode,
}) {
  const styles = {
    card: darkMode
      ? `
        bg-white/5
        border-white/10
        hover:border-amber-500/20
        backdrop-blur-xl
      `
      : `
        bg-white
        border-slate-200
        hover:border-slate-300
      `,

    iconBox: darkMode
      ? `
        bg-[#111827]
        border-white/10
        text-amber-400
      `
      : `
        bg-amber-50
        border-amber-100
        text-amber-600
      `,

    valueText: darkMode
      ? mono
        ? 'font-mono text-amber-400'
        : 'text-white'
      : mono
      ? 'font-mono text-amber-600'
      : 'text-slate-900',
  };

  return (
    <div
      className={`
        p-6
        rounded-3xl
        border
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-2xl
        flex
        items-center
        gap-4
        ${styles.card}
      `}
    >
      {/* ICON */}
      <div
        className={`
          p-4
          rounded-2xl
          border
          shrink-0
          ${styles.iconBox}
        `}
      >
        {Icon && (
          <Icon className="w-5 h-5" />
        )}
      </div>

      {/* TEXT */}
      <div className="min-w-0">

        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.25em]
            font-black
            opacity-50
            truncate
          "
        >
          {label}
        </p>

        <h3
          className={`
            mt-2
            text-lg
            font-bold
            truncate
            ${styles.valueText}
          `}
        >
          {value || 'N/A'}
        </h3>
      </div>
    </div>
  );
}

export default memo(MetaCards);