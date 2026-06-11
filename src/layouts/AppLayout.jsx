import {
  useState,
  useEffect,
} from 'react';

import {
  Menu,
  X,
} from 'lucide-react';

import Sidebar from '../components/dashboard/Sidebar';

import useSession from '../hooks/useSession';

export default function AppLayout({
  children,
}) {

  /**
   * =========================================================
   * SESSION
   * =========================================================
   */

  const {
    clearSession,
  } = useSession();

  /**
   * =========================================================
   * MOBILE SIDEBAR
   * =========================================================
   */

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  /**
   * =========================================================
   * LOGOUT
   * =========================================================
   */
    const handleLogout = () => {

      console.log("Logout clicked");

      clearSession();

      console.log(
        "Session after logout:",
        localStorage.getItem("session")
      );

      window.location.href = "/";

    };

  /**
   * =========================================================
   * CLOSE SIDEBAR ON RESIZE
   * =========================================================
   */

  useEffect(() => {

    const handleResize = () => {

      if (
        window.innerWidth >= 1024
      ) {

        setMobileSidebarOpen(
          false
        );

      }

    };

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {

      window.removeEventListener(
        'resize',
        handleResize
      );

    };

  }, []);

  return (
    <div
      className="
        min-h-screen
        flex
        bg-[#F8FAFC]
        overflow-hidden
      "
    >

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileSidebarOpen && (

        <div
          onClick={() =>
            setMobileSidebarOpen(
              false
            )
          }
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
            lg:hidden
          "
        />

      )}

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <div
        className="
          hidden
          lg:flex
          shrink-0
        "
      >

        <Sidebar
          onLogout={handleLogout}
        />

      </div>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

        <div
          className={`
            fixed
            top-0
            left-0
            z-50
            h-screen
            w-[280px]
            transition-transform
            duration-300
            lg:hidden
            ${
              mobileSidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full'
            }
          `}
        >

        <Sidebar
          onLogout={
            handleLogout
          }
        />

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          flex-1
          flex
          flex-col
          min-w-0
          overflow-hidden
        "
      >

        {/* ===================================================
            MOBILE TOP BAR
        =================================================== */}

        <header
          className="
            lg:hidden
            sticky
            top-0
            z-30
            flex
            items-center
            justify-between
            px-4
            py-4
            border-b
            border-slate-200
            bg-white/95
            backdrop-blur-xl
          "
        >

          {/* LEFT */}
          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setMobileSidebarOpen(
                  true
                )
              }
              className="
                flex
                items-center
                justify-center
                w-11
                h-11
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
              "
            >

              {mobileSidebarOpen ? (
                <X size={18} />
              ) : (
                <Menu size={18} />
              )}

            </button>

            <div>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  text-amber-500
                  font-black
                "
              >
                QC App
              </p>

              <h1
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                QC Training
              </h1>

            </div>

          </div>

        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main
          className="
            flex-1
            overflow-y-auto
            overflow-x-hidden
            min-w-0
            bg-[#F8FAFC]
            px-2
            sm:px-4
            md:px-6
            lg:px-0
            pb-10
          "
        >

          {children}

        </main>

      </div>

    </div>
  );
}
