import React, {
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  User,
  Loader2,
  ShieldCheck,
  Sun,
  Moon,
  BadgeCheck,
} from 'lucide-react';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import {
  db,
} from '../config/firebase';

import {
  useTheme,
} from '../context/ThemeContext';

import useSession from '../hooks/useSession';

import {
  detectUserRole,
  ROLE_LABELS,
  ROLES,
} from '../config/constants/roles';

export default function Login({
  onLoginSuccess,
}) {

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [employeeId, setEmployeeId] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const {
    darkMode,
    toggleTheme,
  } = useTheme();

  const {
    saveSession,
  } = useSession();

  const navigate =
    useNavigate();

  /**
   * =========================================================
   * DETECTED ROLE PREVIEW
   * =========================================================
   */

  const detectedRole =
    useMemo(() => {

      if (!employeeId.trim()) {
        return null;
      }

      return detectUserRole(
        employeeId
      );

    }, [employeeId]);

  /**
   * =========================================================
   * LOGIN
   * =========================================================
   */

  const handleLogin =
    async (event) => {

      event.preventDefault();

      if (loading) {
        return;
      }

      setLoading(true);
      setError('');

      try {

        /**
         * SANITIZE INPUT
         */

        const sanitizedEmployeeId =
          employeeId
            .trim()
            .toUpperCase();

        /**
         * BASIC VALIDATION
         */

        if (
          !sanitizedEmployeeId
        ) {

          setError(
            'Employee ID is required.'
          );

          return;

        }

        if (
          sanitizedEmployeeId.length < 4
        ) {

          setError(
            'Invalid Employee ID format.'
          );

          return;

        }

        /**
         * FIRESTORE QUERY
         */

        const userQuery = query(
          collection(
            db,
            'users'
          ),
          where(
            'employeeId',
            '==',
            sanitizedEmployeeId
          )
        );

        const querySnapshot =
          await getDocs(
            userQuery
          );

        /**
         * USER NOT FOUND
         */

        if (
          querySnapshot.empty
        ) {

          setError(
            'Employee ID not found.'
          );

          return;

        }

        /**
         * USER DOCUMENT
         */

        const userDoc =
          querySnapshot.docs[0];

        const userData =
          userDoc.data();

        /**
         * DETECT ROLE
         */

        const role =
          detectUserRole(
            sanitizedEmployeeId
          );

        /**
         * BUILD SESSION
         */

        const sessionData = {

          id:
            userDoc.id,

          ...userData,

          role,

          loginTime:
            Date.now(),

          lastLoginAt:
            new Date()
              .toISOString(),

        };

        /**
         * SAVE SESSION
         */

        saveSession(
          sessionData
        );

        /**
         * OPTIONAL CALLBACK
         */

        if (
          onLoginSuccess
        ) {

          onLoginSuccess(
            sessionData
          );

        }

        /**
         * REDIRECT
         */

        navigate(
          '/dashboard'
        );

      } catch (error) {

        console.error(
          'Authentication Error:',
          error
        );

        setError(
          'Unable to connect to server.'
        );

      } finally {

        setLoading(false);

      }

    };

  /**
   * =========================================================
   * STYLES
   * =========================================================
   */

  const styles = {

    page: darkMode
      ? 'bg-[#09090B] text-white'
      : 'bg-[#F8FAFC] text-slate-900',

    border: darkMode
      ? 'border-zinc-800'
      : 'border-slate-200',

    glass: darkMode
      ? `
        bg-zinc-900/80
        border-zinc-800
      `
      : `
        bg-white/90
        border-slate-200
      `,

  };

  return (
    <div
      className={`
        min-h-screen
        flex
        flex-col
        md:flex-row
        overflow-hidden
        transition-all
        duration-500
        ${styles.page}
      `}
    >

      {/* BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">

        <div
          className={`
            absolute
            top-[-10%]
            left-[-10%]
            w-[28rem]
            h-[28rem]
            rounded-full
            blur-[100px]
            opacity-10
            ${
              darkMode
                ? 'bg-blue-700'
                : 'bg-blue-300'
            }
          `}
        />

        <div
          className={`
            absolute
            bottom-[-15%]
            right-[-10%]
            w-[24rem]
            h-[24rem]
            rounded-full
            blur-[100px]
            opacity-10
            ${
              darkMode
                ? 'bg-amber-500'
                : 'bg-amber-300'
            }
          `}
        />

      </div>

      {/* LEFT PANEL */}
      <div
        className={`
          relative
          w-full
          md:w-[42%]
          p-12
          flex
          flex-col
          justify-between
          border-r
          z-10
          ${styles.border}
        `}
      >

        {/* LOGO */}
        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-amber-500
              flex
              items-center
              justify-center
            "
          >
            <ShieldCheck
              size={24}
              className="text-slate-950"
            />
          </div>

          <div>

            <h1
              className="
                font-black
                text-lg
                tracking-wide
              "
            >
              QC Nexus
            </h1>

            <p
              className="
                text-xs
                opacity-50
                uppercase
                tracking-[0.25em]
              "
            >
              Enterprise QC Platform
            </p>

          </div>

        </div>

        {/* HERO */}
        <div className="max-w-md">

          <p
            className="
              text-amber-500
              font-black
              uppercase
              tracking-[0.35em]
              text-xs
              mb-5
            "
          >
            Manufacturing Workforce
          </p>

          <h2
            className="
              text-5xl
              font-black
              leading-tight
              mb-6
            "
          >
            QC Training &
            Competency Management.
          </h2>

          <p
            className="
              text-sm
              leading-7
              opacity-60
              max-w-sm
            "
          >
            Centralized quality
            control inspection,
            audit validation,
            workforce training,
            and operational
            compliance system.
          </p>

        </div>

        {/* FOOTER */}
        <div
          className="
            text-xs
            uppercase
            tracking-widest
            opacity-40
            space-y-2
          "
        >

          <p>
            Version 2.1 Enterprise
          </p>

          <p>
            Powered by QC Nexus
          </p>

        </div>

      </div>

      {/* RIGHT PANEL */}
      <div
        className="
          flex-1
          flex
          items-center
          justify-center
          p-8
          md:p-12
          relative
          z-10
        "
      >

        <div
          className={`
            w-full
            max-w-[430px]
            rounded-3xl
            border
            p-8
            backdrop-blur-xl
            shadow-2xl
            ${styles.glass}
          `}
        >

          {/* HEADER */}
          <div className="mb-8">

            <h3
              className="
                text-3xl
                font-black
                mb-3
              "
            >
              Welcome Back
            </h3>

            <p
              className="
                text-sm
                opacity-60
                leading-6
              "
            >
              Sign in using your
              employee ID to access
              the QC training and
              inspection portal.
            </p>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* INPUT */}
            <div className="space-y-3">

              <div className="relative">

                <User
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    opacity-40
                  "
                />

                <input
                  type="text"
                  placeholder="Employee ID"
                  value={employeeId}
                  onChange={(event) =>
                    setEmployeeId(
                      event.target.value
                    )
                  }
                  autoComplete="off"
                  required
                  className={`
                    w-full
                    pl-12
                    pr-4
                    py-4
                    rounded-2xl
                    border
                    outline-none
                    transition-all
                    font-semibold
                    ${
                      darkMode
                        ? `
                          bg-[#111827]
                          border-slate-700
                          text-white
                          focus:border-amber-500
                        `
                        : `
                          bg-white
                          border-slate-300
                          text-slate-900
                          focus:border-amber-500
                        `
                    }
                  `}
                />

              </div>

              {/* ROLE PREVIEW */}
              {detectedRole && (

                <div
                  className={`
                    flex
                    items-center
                    gap-2
                    px-4
                    py-3
                    rounded-2xl
                    border
                    text-xs
                    uppercase
                    tracking-[0.25em]
                    font-black
                    ${
                      detectedRole ===
                      ROLES.EXECUTIVE
                        ? `
                          bg-amber-500/10
                          text-amber-400
                          border-amber-500/20
                        `
                        : `
                          bg-blue-500/10
                          text-blue-400
                          border-blue-500/20
                        `
                    }
                  `}
                >

                  <BadgeCheck
                    size={14}
                  />

                  {
                    ROLE_LABELS[
                      detectedRole
                    ]
                  }

                </div>

              )}

            </div>

            {/* ERROR */}
            {error && (

              <div
                className="
                  text-red-500
                  text-sm
                  font-semibold
                "
              >
                {error}
              </div>

            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                py-4
                rounded-2xl
                bg-amber-500
                hover:bg-amber-400
                text-slate-950
                font-black
                uppercase
                tracking-widest
                transition-all
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {loading ? (

                <Loader2
                  className="
                    animate-spin
                    mx-auto
                  "
                />

              ) : (

                'Access Portal'

              )}

            </button>

          </form>

          {/* THEME */}
          <button
            type="button"
            onClick={toggleTheme}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              mt-6
              text-xs
              uppercase
              tracking-widest
              font-bold
              opacity-60
              hover:opacity-100
              hover:text-amber-500
              transition-all
            "
          >

            {darkMode ? (
              <Sun size={14} />
            ) : (
              <Moon size={14} />
            )}

            Toggle Theme

          </button>

        </div>

      </div>

    </div>
  );
}