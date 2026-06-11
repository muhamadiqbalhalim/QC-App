import { useMemo } from "react";

import { NavLink, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Sparkles,
  UserCircle2,
  GraduationCap,
  ClipboardCheck,
} from "lucide-react";

import useSession from "../../hooks/useSession";

import { ROLE_LABELS, isExecutive } from "../../config/constants/roles";

import { Button, Badge } from "../ui";

export default function Sidebar({
  onLogout,
}) {

  const location = useLocation();
  const { getSession } = useSession();
  const currentUser = useMemo(() => {
    return getSession();
  }, [getSession]);

  const executiveMode = isExecutive(currentUser?.role);
  const styles = {
    sidebar: `
      bg-white
      border-slate-200
      text-slate-900
    `,

    navItem: `
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

  const operatorNavigation = useMemo(
    () => [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },

      {
        label: "My Trainings",
        icon: GraduationCap,
        path: "/my-trainings",
      },

      {
        label: "My Inspection Forms",
        icon: ClipboardCheck,
        path: "/inspection-forms",
      },
    ],
    [],
  );

  const executiveNavigation = useMemo(
    () => [
      {
        label: "Dashboard",

        icon: LayoutDashboard,

        path: "/dashboard",
      },

      {
        label: "Review Submission",

        icon: ShieldCheck,

        path: "/review-form",
      },
    ],
    [],
  );

  /**
   * =========================================================
   * ACTIVE CHECK
   * =========================================================
   */

  const isActive = (path) => {
    return location.pathname === path;
  };


  /**
   * =========================================================
   * SIDEBAR CONTENT
   * =========================================================
   */

  const renderSidebarContent = () => (
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
            border-slate-200
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
              <Sparkles size={15} className="text-amber-500" />

              <p
                className="
                    text-xs
                    uppercase
                    tracking-[0.15em]
                    text-amber-500
                    font-black
                  "
              >
                QC App
              </p>
            </div>

            <h1
              className="
                  text-xl
                  font-black
                  leading-tight
                "
            >
              NSSB
            </h1>
          </div>
        </div>
      </div>

      {/* USER */}

      <div
        className="
            hidden
            lg:block
            px-5
            py-5
            border-b
            border-slate-200
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
              {currentUser?.name || "User"}
            </h2>

            <p
              className="
                  text-sm
                  opacity-60
                  mt-1
                "
            >
              {currentUser?.employeeId}
            </p>

            <div className="mt-3">
              <Badge variant="warning" size="md">
                {ROLE_LABELS[currentUser?.role]}
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

          {(executiveMode ? executiveNavigation : operatorNavigation).map(
            (item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`
            flex
            items-center
            gap-4
            min-h-[48px]
            px-4
            rounded-2xl
            font-bold
            transition-all
            duration-200
            ${isActive(item.path) ? styles.activeItem : styles.navItem}
          `}
                >
                  <Icon size={20} />

                  <span
                    className="
              text-[15px]
              font-semibold
            "
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            },
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
    p-4
    border-t
    border-slate-200
    pb-safe
  "
      >
        <Button
          variant="danger"
          size="lg"
          fullWidth
          icon={LogOut}
          onClick={onLogout}
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
      {/* DESKTOP SIDEBAR */}
      {/* ================================================= */}

      <aside
        className="
            flex
            flex-col
            w-[280px]
            h-screen
          "
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
