export default function Card({

  children,

  className = '',

  padding = 'default',

  hover = false,

}) {

  const paddingStyles = {

    none: '',

    sm: 'p-4',

    default: 'p-5 sm:p-6',

    lg: 'p-6 sm:p-8',

  };

  return (

    <div
      className={`
        rounded-3xl
        border
        bg-white
        border-slate-200
        text-slate-900
        backdrop-blur-xl
        shadow-sm
        transition-all
        duration-300
        ${
          hover
            ? `
              hover:-translate-y-1
              hover:shadow-xl
            `
            : ''
        }
        ${paddingStyles[padding]}
        ${className}
      `}
    >

      {children}

    </div>

  );

}
