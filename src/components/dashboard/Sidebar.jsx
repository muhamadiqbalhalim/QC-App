import React, {
  useMemo,
  useState,
} from 'react';

import { NavLink } from 'react-router-dom';

import {
  ShieldCheck,
  LayoutDashboard,
  Database,
  FileText,
  ChevronRight,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Users,
  BarChart3,
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';

import { FORM_REGISTRY } from '../../config/FormRegistry';

import useSession from '../../hooks/useSession';

import { ROLES } from '../../config/constants/roles';

export default function Sidebar({
  onLogout,
}) {

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const { darkMode } =
    useTheme();

  const { getSession } =
    useSession();

  /**
   * =========================================================
   * USER
   * =========================================================
   */

  const currentUser =
    getSession();

  const userRole =
    currentUser?.role ||
    ROLES.OPERATOR;

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [
    isCollapsed,
    setIsCollapsed,
  ] = useState(false);

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(true);

  /**
   * =========================================================
   * STYLES
   * =========================================================
   */

  const styles = {

    active: `
      w-full
      flex
      items-center
      justify-between
      min-h-[56px]
      px-4
      py-3.5
      rounded-2xl
      text-sm
      font-semibold
      border
      transition-all
      duration-300
      shadow-lg
      ${
        darkMode
          ? `
            bg-white/10
            border-white/10
            text-amber-400
            backdrop-blur-xl
          `
          : `
            bg-white
            border-slate-200
            text-slate-900
          `
      }
    `,

    inactive: `
      w-full
      flex
      items-center
      justify-between
      min-h-[56px]
      px-4
      py-3.5
      rounded-2xl
      text-sm
      transition-all
      duration-300
      ${
        darkMode
          ? `
            text-slate-400
            hover:bg-white/5
            hover:text-white
          `
          : `
            text-slate-600
            hover:bg-slate-100
            hover:text-slate-900
          `
      }
    `,

    subActive: `
      w-full
      flex
      items-center
      gap-3
      min-h-[52px]
      px-4
      py-3
      rounded-2xl
      text-xs
      font-semibold
      border
      transition-all
      duration-300
      ${
        darkMode
          ? `
            bg-amber-500/10
            border-amber-500/20
            text-amber-400
          `
          : `
            bg-amber-100
            border-amber-200
            text-amber-700
          `
      }
    `,

    subInactive: `
      w-full
      flex
      items-center
      gap-3
      min-h-[52px]
      px-4
      py-3
      rounded-2xl
      text-xs
      transition-all
      duration-300
      ${
        darkMode
          ? `
            text-slate-500
            hover:bg-white/5
            hover:text-slate-200
          `
          : `
            text-slate-500
            hover:bg-slate-100
            hover:text-slate-900
          `
      }
    `,

  };

  /**
   * =========================================================
   * MAIN MENUS
   * =========================================================
   */

  const mainMenus =
    useMemo(() => {

      const baseMenus = [

        {
          label:
            'Dashboard',

          icon:
            LayoutDashboard,

          path:
            '/dashboard',
        },

      ];

      if (
        userRole === ROLES.ADMIN
      ) {

        baseMenus.push(

          {
            label:
              'Analytics',

            icon:
              BarChart3,

            path:
              '/analytics',
          },

          {
            label:
              'User Management',

            icon:
              Users,

            path:
              '/users',
          }

        );

      }

      return baseMenus;

    }, [userRole]);

  /**
   * =========================================================
   * AVAILABLE FORMS
   * =========================================================
   */

  const availableForms =
    useMemo(() => {

      return Object.entries(
        FORM_REGISTRY
      ).filter(([, config]) => {

        if (
          !config.allowedRoles
        ) {

          return true;

        }

        return config.allowedRoles.includes(
          userRole
        );

      });

    }, [userRole]);

  /**
   * =========================================================
   * MAIN NAV
   * =========================================================
   */

  const renderMainNav = ({
    label,
    icon: Icon,
    path,
  }) => (

    <NavLink
      key={path}
      to={path}
      className={({ isActive }) =>
        isActive
          ? styles.active
          : styles.inactive
      }
    >

      <div className="flex items-center gap-4 min-w-0">

        <Icon
          className="
            w-5
            h-5
            shrink-0
          "
        />

        {!isCollapsed && (

          <span className="truncate">
            {label}
          </span>

        )}

      </div>

      {!isCollapsed && (

        <ChevronRight
          className="
            w-4
            h-4
            opacity-40
            shrink-0
          "
        />

      )}

    </NavLink>

  );

  /**
   * =========================================================
   * FORM LINKS
   * =========================================================
   */

  const renderFormLinks =
    () => {

      return availableForms.map(
        ([id, config]) => (

          <NavLink
            key={id}
            to={`/registration/${id}`}
            className={({ isActive }) =>
              isActive
                ? styles.subActive
                : styles.subInactive
            }
          >

            <span
              className={`
                w-2.5
                h-2.5
                rounded-full
                shrink-0
                ${
                  config.severity ===
                  'Critical'
                    ? 'bg-red-500'
                    : config.severity ===
                      'High'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }
              `}
            />

            {!isCollapsed && (

              <div className="overflow-hidden min-w-0">

                <p className="truncate font-semibold">
                  {config.title}
                </p>

                <p
                  className="
                    truncate
                    text-[10px]
                    opacity-50
                    mt-1
                  "
                >
                  {id}
                </p>

              </div>

            )}

          </NavLink>

        )
      );

    };

  return (
    <aside
      className={`
        h-screen
        ${
          isCollapsed
            ? 'lg:w-24'
            : 'w-[85vw] max-w-[320px] lg:w-[280px]'
        }
        border-r
        transition-all
        duration-300
        flex
        flex-col
        justify-between
        overflow-hidden
        ${
          darkMode
            ? `
              bg-[#0B1120]/95
              border-white/10
              backdrop-blur-xl
            `
            : `
              bg-white
              border-slate-200
            `
        }
      `}
    >

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          overflow-x-hidden
          px-4
          py-5
        "
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            pb-6
            mb-6
            border-b
            border-slate-200/10
            gap-3
          "
        >

          {/* LEFT */}
          <div
            className="
              flex
              items-center
              gap-3
              overflow-hidden
              min-w-0
            "
          >

            <div
              className={`
                p-3
                rounded-2xl
                border
                shrink-0
                ${
                  darkMode
                    ? `
                      bg-white/5
                      border-white/10
                    `
                    : `
                      bg-slate-50
                      border-slate-200
                    `
                }
              `}
            >

              <ShieldCheck
                className="
                  w-5
                  h-5
                  text-amber-500
                "
              />

            </div>

            {!isCollapsed && (

              <div className="min-w-0">

                <h2
                  className="
                    text-sm
                    font-black
                    tracking-[0.2em]
                    truncate
                  "
                >
                  QC NEXUS
                </h2>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.2em]
                    opacity-50
                    mt-1
                    truncate
                  "
                >
                  {userRole}
                </p>

              </div>

            )}

          </div>

          {/* COLLAPSE */}
          <button
            onClick={() =>
              setIsCollapsed(
                !isCollapsed
              )
            }
            className="
              hidden
              lg:flex
              items-center
              justify-center
              text-slate-500
              hover:text-amber-500
              transition-colors
              shrink-0
            "
          >

            {isCollapsed ? (

              <PanelLeftOpen
                className="
                  w-5
                  h-5
                "
              />

            ) : (

              <PanelLeftClose
                className="
                  w-5
                  h-5
                "
              />

            )}

          </button>

        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="space-y-7">

          {/* MAIN */}
          <section>

            {!isCollapsed && (

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  font-black
                  opacity-40
                  mb-4
                  ml-1
                "
              >
                Main Menu
              </p>

            )}

            <div className="space-y-2.5">
              {mainMenus.map(
                renderMainNav
              )}
            </div>

          </section>

          {/* TRAINING */}
          <section>

            {!isCollapsed && (

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  font-black
                  opacity-40
                  mb-4
                  ml-1
                "
              >
                Training Management
              </p>

            )}

            <div
              className={`
                space-y-2
                ${
                  !isCollapsed
                    ? `
                      pl-3
                      border-l
                      border-white/10
                    `
                    : ''
                }
              `}
            >

              {/* OG */}
              <NavLink
                to="/training-og"
                className={({
                  isActive,
                }) =>
                  isActive
                    ? styles.subActive
                    : styles.subInactive
                }
              >

                <Database
                  className="
                    w-4
                    h-4
                    shrink-0
                  "
                />

                {!isCollapsed && (

                  <span>
                    WIS Training
                    (OG)
                  </span>

                )}

              </NavLink>

              {/* FORMS */}
              {!isCollapsed && (

                <>

                  <button
                    onClick={() =>
                      setIsFormOpen(
                        !isFormOpen
                      )
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      min-h-[52px]
                      px-4
                      py-3
                      rounded-2xl
                      text-xs
                      font-medium
                      transition-all
                      ${
                        darkMode
                          ? `
                            text-slate-400
                            hover:text-white
                          `
                          : `
                            text-slate-600
                            hover:text-slate-900
                          `
                      }
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <FileText
                        className="
                          w-4
                          h-4
                        "
                      />

                      <span>
                        Training Forms
                      </span>

                    </div>

                    <ChevronDown
                      className={`
                        w-4
                        h-4
                        transition-transform
                        ${
                          isFormOpen
                            ? 'rotate-180'
                            : ''
                        }
                      `}
                    />

                  </button>

                  {isFormOpen && (

                    <div
                      className="
                        ml-4
                        pl-3
                        border-l
                        border-white/10
                        space-y-2
                      "
                    >

                      {renderFormLinks()}

                    </div>

                  )}

                </>

              )}

            </div>

          </section>

          {/* ADMIN */}
          {userRole ===
            ROLES.ADMIN &&
            !isCollapsed && (

              <section>

                <div
                  className="
                    p-5
                    rounded-3xl
                    border
                    border-amber-500/20
                    bg-amber-500/5
                  "
                >

                  <div className="flex items-center gap-2 mb-3">

                    <Shield
                      className="
                        w-4
                        h-4
                        text-amber-500
                      "
                    />

                    <span
                      className="
                        text-[10px]
                        uppercase
                        tracking-widest
                        font-black
                        text-amber-500
                      "
                    >
                      Admin Access
                    </span>

                  </div>

                  <p
                    className="
                      text-[11px]
                      leading-relaxed
                      opacity-60
                    "
                  >
                    Elevated access enabled
                    for analytics and
                    training management.
                  </p>

                </div>

              </section>

            )}

        </nav>

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="
          p-4
          border-t
          border-white/10
          shrink-0
        "
      >

        <button
          onClick={onLogout}
          className="
            w-full
            flex
            items-center
            gap-3
            min-h-[56px]
            px-4
            py-3
            rounded-2xl
            text-xs
            font-black
            uppercase
            tracking-widest
            text-red-500
            hover:bg-red-500
            hover:text-white
            transition-all
          "
        >

          <LogOut
            className="
              w-4
              h-4
              shrink-0
            "
          />

          {!isCollapsed && (

            <span>
              Terminate Session
            </span>

          )}

        </button>

      </div>

    </aside>
  );
}