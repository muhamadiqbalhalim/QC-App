import React from 'react';

import {
  X,
} from 'lucide-react';

export default function Modal({

  open,

  onClose,

  title,

  children,

  width = 'max-w-2xl',

}) {

  if (!open) {
    return null;
  }

  return (

    <div
      className="
        fixed
        inset-0
        z-[999]
        bg-black/60
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
      onClick={onClose}
    >

      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className={`
          relative
          w-full
          ${width}
          rounded-3xl
          border
          shadow-2xl
          overflow-hidden
          bg-white
          border-slate-200
          text-slate-900
        `}
      >

        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            px-6
            py-5
            border-b
            border-slate-200
          "
        >

          <h2
            className="
              text-xl
              font-black
              break-words
            "
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              p-2
              rounded-xl
              hover:bg-slate-500/10
              transition-all
            "
          >

            <X size={20} />

          </button>

        </div>

        {/* BODY */}
        <div
          className="
            p-6
            max-h-[80vh]
            overflow-y-auto
          "
        >

          {children}

        </div>

      </div>

    </div>

  );

}