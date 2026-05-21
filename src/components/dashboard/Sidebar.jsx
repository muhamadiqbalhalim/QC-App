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
  const { darkMode } = useTheme();

  const { getSession } = useSession();

  const currentUser = getSession();

  const userRole =
    currentUser?.role ||
    ROLES.OPERATOR;

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [isFormOpen, setIsFormOpen] =
    useState(true);

  const styles = {
    active: `
      w-full
      flex
      items-center
      justify-between
      p-3.5
      rounded-2xl
      text-sm
      font-semibold
      border
      transition-all
      shadow-lg
      hover:scale-[1.02]
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
      p-3.5
      rounded-2xl
      text-sm
      transition-all
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
      p-3
      rounded-xl
      text-[11px]
      font-medium
      border
      transition-all
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
      p-3
      rounded-xl
      text-[11px]
      transition-all
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
   * Main menu
   */
  const mainMenus = useMemo(() => {
    const baseMenus = [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
      },
    ];

    if (userRole === ROLES.ADMIN) {
      baseMenus.push(
        {
          label: 'Analytics',
          icon: BarChart3,
          path: '/analytics',
        },
        {
          label: 'User Management',
          icon: Users,
          path: '/users',
        }
      );
    }

    return baseMenus;
  }, [userRole]);

  /**
   * Dynamic form links
   */
  const availableForms =
    useMemo(() => {
      return Object.entries(
        FORM_REGISTRY
      ).filter(([, config]) => {
        if (!config.allowedRoles) {
          return true;
        }

        return config.allowedRoles.includes(
          userRole
        );
      });
    }, [userRole]);

  /**
   * Main nav
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
      <div className="flex items-center gap-3">

        <Icon className="w-4 h-4 shrink-0" />

        {!isCollapsed && (
          <span>{label}</span>
        )}
      </div>

      {!isCollapsed && (
        <ChevronRight className="w-4 h-4 opacity-40" />
      )}
    </NavLink>
  );

  /**
   * Dynamic form links
   */
  const renderFormLinks = () => {
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
              w-2
              h-2
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
            <div className="overflow-hidden">
              <p className="truncate font-semibold">
                {config.title}
              </p>

              <p className="truncate text-[9px] opacity-50 mt-0.5">
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
        ${
          isCollapsed
            ? 'w-24'
            : 'w-[260px]'
        }
        border-r
        transition-all
        duration-300
        flex
        flex-col
        justify-between
        p-5
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
      {/* TOP */}
      <div>

        {/* HEADER */}
        <div
          className="
            flex
            items-center
            justify-between
            pb-6
            mb-6
            border-b
            border-slate-200/10
          "
        >
          <div className="flex items-center gap-3 overflow-hidden">

            <div
              className={`
                p-2.5
                rounded-2xl
                border
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
              <div>

                <h2 className="text-sm font-black tracking-widest">
                  QC NEXUS
                </h2>

                <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mt-1">
                  {userRole}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              setIsCollapsed(
                !isCollapsed
              )
            }
            className="
              text-slate-500
              hover:text-amber-500
              transition-colors
            "
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-6">

          {/* MAIN MENU */}
          <section>

            {!isCollapsed && (
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.25em]
                  font-black
                  opacity-40
                  mb-4
                  ml-1
                "
              >
                Main Menu
              </p>
            )}

            <div className="space-y-2">
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
                  text-[9px]
                  uppercase
                  tracking-[0.25em]
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
                space-y-1
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
                <Database className="w-3.5 h-3.5 shrink-0" />

                {!isCollapsed && (
                  <span>
                    WIS Training
                    (OG)
                  </span>
                )}
              </NavLink>

              {/* DROPDOWN */}
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
                      p-3
                      rounded-xl
                      text-[11px]
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

                      <FileText className="w-3.5 h-3.5" />

                      <span>
                        Training Forms
                      </span>

                    </div>

                    <ChevronDown
                      className={`
                        w-3.5
                        h-3.5
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
                        pl-2
                        border-l
                        border-white/10
                        space-y-1
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
                    p-4
                    rounded-2xl
                    border
                    border-amber-500/20
                    bg-amber-500/5
                  "
                >
                  <div className="flex items-center gap-2 mb-2">

                    <Shield className="w-4 h-4 text-amber-500" />

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
                      text-[10px]
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

      {/* FOOTER */}
      <div>

        <button
          onClick={onLogout}
          className="
            w-full
            flex
            items-center
            gap-3
            p-3
            rounded-2xl
            text-xs
            font-bold
            text-red-500
            hover:bg-red-500
            hover:text-white
            transition-all
          "
        >
          <LogOut className="w-4 h-4 shrink-0" />

          {!isCollapsed && (
            <span>
              TERMINATE SESSION
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}