const variants = {

  primary: `
    bg-amber-500
    hover:bg-amber-400
    text-slate-950
    border-amber-500
  `,

  secondary: `
    bg-white
    dark:bg-slate-900
    border-slate-300
    dark:border-slate-700
    hover:border-amber-500/30
  `,

  success: `
    bg-emerald-500
    hover:bg-emerald-400
    text-white
    border-emerald-500
  `,

  danger: `
    bg-red-500
    hover:bg-red-400
    text-white
    border-red-500
  `,

  info: `
    bg-blue-500
    hover:bg-blue-400
    text-white
    border-blue-500
  `,

};

const sizes = {

  sm: `
    min-h-[42px]
    px-4
    py-2
    text-sm
  `,

  md: `
    min-h-[52px]
    px-5
    py-3
    text-sm
  `,

  lg: `
    min-h-[60px]
    px-6
    py-4
    text-base
  `,

};

export default function Button({

  children,

  type = 'button',

  variant = 'primary',

  size = 'md',

  fullWidth = false,

  loading = false,

  disabled = false,

  icon: Icon,

  className = '',

  ...props

}) {

  return (

    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        font-black
        transition-all
        duration-200
        active:scale-[0.98]
        disabled:opacity-50
        disabled:cursor-not-allowed
        shadow-sm
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >

      {Icon && !loading && (
        <Icon size={18} />
      )}

      {loading && (

        <div
          className="
            w-4
            h-4
            border-2
            border-current
            border-t-transparent
            rounded-full
            animate-spin
          "
        />

      )}

      {children}

    </button>

  );

}
