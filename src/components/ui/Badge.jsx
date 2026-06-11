const variants = {

  default: `
    bg-slate-500/10
    text-slate-600
    dark:text-slate-300
    border-slate-300
    dark:border-slate-700
  `,

  success: `
    bg-emerald-500/10
    text-emerald-500
    border-emerald-500/20
  `,

  danger: `
    bg-red-500/10
    text-red-500
    border-red-500/20
  `,

  warning: `
    bg-amber-500/10
    text-amber-500
    border-amber-500/20
  `,

  info: `
    bg-blue-500/10
    text-blue-500
    border-blue-500/20
  `,

};

const sizes = {

  sm: `
    text-[10px]
    px-2.5
    py-1
  `,

  md: `
    text-xs
    px-3
    py-1.5
  `,

  lg: `
    text-sm
    px-4
    py-2
  `,

};

export default function Badge({

  children,

  variant = 'default',

  size = 'md',

  className = '',

}) {

  return (

    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-xl
        border
        font-black
        uppercase
        tracking-wide
        whitespace-nowrap
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >

      {children}

    </span>

  );

}
