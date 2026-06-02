import React, {
  useMemo,
  useState,
} from 'react';

import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  LogOut,
  X,
  Menu,
  Sparkles,
  UserCircle2,
} from 'lucide-react';

import {
  useTheme,
} from '../../context/ThemeContext';

import useSession from '../../hooks/useSession';

import {
  ROLE_LABELS,
  isExecutive,
} from '../../config/constants/roles';

import {
  Button,
  Badge,
} from '../ui';

export default function Sidebar() {

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { darkMode } =
    useTheme();

  const {
    getSession,
    clearSession,
  } = useSession();

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  /**
   * =========================================================
   * USER
   * =========================================================
   */

  const currentUser =
  useMemo(() => {
    return getSession();
  }, [getSession]);

  const executiveMode =
    isExecutive(
      currentUser?.role
    );

  /**
   * =========================================================
   * STYLES
   * =========================================================
   */

  const styles = {

    sidebar: darkMode
      ? `
        bg-[#09090B]
        border-zinc-800
        text-white
      `
      : `
        bg-white
        border-slate-200
        text-slate-900
      `,

    navItem: darkMode
      ? `
        hover:bg-zinc-800/70
      `
      : `
        hover:bg-slate-100
      `,

    activeItem: `
      bg-amber-500
      text-slate-950
      shadow-lg
      shadow-amber-500/20
    `,

  };

  /**
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const operatorNavigation =
    useMemo(() => [

      {
        label:
          'Dashboard',

        icon:
          LayoutDashboard,

        path:
          '/dashboard',
      },

      {
        label:
          'WIS Training Registry',

        icon:
          BookOpen,

        path:
          '/training-og',
      },

    ], []);

  const executiveNavigation =
    useMemo(() => [

      {
        label:
          'Dashboard',

        icon:
          LayoutDashboard,

        path:
          '/dashboard',
      },

      {
        label:
          'Review Submission',

        icon:
          ShieldCheck,

        path:
          '/review-form',
      },

    ], []);

  /**
   * =========================================================
   * ACTIVE CHECK
   * =========================================================
   */

  const isActive =
    (path) => {

      return (
        location.pathname ===
        path
      );

    };

  /**
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const handleLogout =
    () => {

      clearSession();

      navigate('/');

    };

  /**
   * =========================================================
   * SIDEBAR CONTENT
   * =========================================================
   */

  const SidebarContent =
    () => (

      <div
        className={`
          flex
          flex-col
          h-full
          border-r
          ${styles.sidebar}
        `}
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          className="
            px-5
            py-5
            border-b
            border-white/10
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >

            <div className="min-w-0">

              <div className="flex items-center gap-2 mb-3">

                <Sparkles
                  size={15}
                  className="text-amber-500"
                />

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.15em]
                    text-amber-500
                    font-black
                  "
                >
                  QC Training System
                </p>

              </div>

              <h1
                className="
                  text-2xl
                  font-black
                  leading-tight
                "
              >
                NSSB
              </h1>

            </div>

            {/* MOBILE CLOSE */}
            <button
              onClick={() =>
                setMobileOpen(false)
              }
              className="
                lg:hidden
                p-2
                rounded-xl
                hover:bg-white/10
                transition-all
              "
            >

              <X size={18} />

            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* USER */}
        {/* ================================================= */}

        <div
          className="
            px-5
            py-5
            border-b
            border-white/10
          "
        >

          <div className="flex items-start gap-4">

            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-amber-500/10
                text-amber-500
                flex
                items-center
                justify-center
                shrink-0
              "
            >

              <UserCircle2 size={26} />

            </div>

            <div className="min-w-0 flex-1">

              <h2
                className="
                  font-black
                  text-base
                  break-words
                "
              >
                {
                  currentUser?.name ||
                  'User'
                }
              </h2>

              <p
                className="
                  text-sm
                  opacity-60
                  mt-1
                "
              >
                {
                  currentUser?.employeeId
                }
              </p>

              <div className="mt-3">

                <Badge
                  variant="warning"
                  size="md"
                >

                  {
                    ROLE_LABELS[
                      currentUser?.role
                    ]
                  }

                </Badge>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <div
  className="
    flex-1
    overflow-y-auto
    px-4
    py-5
    space-y-6
  "
>

  {/* MAIN */}
  <div className="space-y-2">

    <p
      className="
        text-xs
        uppercase
        tracking-[0.15em]
        opacity-50
        font-black
        px-3
        mb-3
      "
    >
      Main Navigation
    </p>

    {(executiveMode
      ? executiveNavigation
      : operatorNavigation
    ).map((item) => {

      const Icon =
        item.icon;

      return (

        <NavLink
          key={item.path}
          to={item.path}
          onClick={() =>
            setMobileOpen(false)
          }
          className={`
            flex
            items-center
            gap-4
            min-h-[56px]
            px-4
            rounded-2xl
            font-bold
            transition-all
            duration-200
            ${
              isActive(item.path)
                ? styles.activeItem
                : styles.navItem
            }
          `}
        >

          <Icon size={20} />

          <span className="text-sm">
            {item.label}
          </span>

        </NavLink>

      );

    })}

  </div>

</div>

{/* FOOTER */}
<div
  className="
    p-4
    border-t
    border-white/10
    pb-safe
  "
>

  <Button
    variant="danger"
    size="lg"
    fullWidth
    icon={LogOut}
    onClick={handleLogout}
  >

    Logout

  </Button>

</div>
</div>
    );

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      {/* ================================================= */}
      {/* MOBILE TOPBAR */}
      {/* ================================================= */}

      <div
        className={`
          lg:hidden
          sticky
          top-0
          z-50
          border-b
          backdrop-blur-xl
          px-4
          py-3
          flex
          items-center
          justify-between
          ${styles.sidebar}
        `}
      >

        <div>

          <p
            className="
              text-xs
              uppercase
              tracking-[0.15em]
              text-amber-500
              font-black
              mb-1
            "
          >
            QC Training
          </p>

          <h1 className="font-black">
            NSSB
          </h1>

        </div>

        <button
          onClick={() =>
            setMobileOpen(true)
          }
          className="
            p-3
            rounded-2xl
            bg-amber-500
            text-slate-950
            shadow-lg
            shadow-amber-500/20
          "
        >

          <Menu size={20} />

        </button>

      </div>

      {/* ================================================= */}
      {/* MOBILE OVERLAY */}
      {/* ================================================= */}

      {mobileOpen && (

        <div
          onClick={() =>
            setMobileOpen(false)
          }
          className="
            fixed
            inset-0
            z-[90]
            bg-black/60
            backdrop-blur-sm
            lg:hidden
          "
        />

      )}

      {/* ================================================= */}
      {/* MOBILE SIDEBAR */}
      {/* ================================================= */}

      <div
        className={`
          fixed
          inset-y-0
          left-0
          z-[100]
          w-[90%]
          max-w-[340px]
          transition-transform
          duration-300
          lg:hidden
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >

        <SidebarContent />

      </div>

      {/* ================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ================================================= */}

      <aside
        className="
          hidden
          lg:flex
          lg:flex-col
          lg:w-[320px]
          lg:h-screen
          lg:sticky
          lg:top-0
        "
      >

        <SidebarContent />

      </aside>

    </>

  );

}