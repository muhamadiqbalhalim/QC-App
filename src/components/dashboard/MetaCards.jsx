import React, { memo } from 'react';

function MetaCards({
  icon: Icon,
  label,
  value,
  mono = false,
}) {
  const styles = {

    card: `
      bg-white
      border-slate-200
      hover:border-slate-300
    `,

    iconBox: `
      bg-amber-50
      border-amber-100
      text-amber-600
    `,

    valueText: mono
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