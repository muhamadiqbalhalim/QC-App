import {
  useCallback,
} from 'react';

import {
  STORAGE_KEYS,
} from '../config/constants/storageKeys';

import {
  ROLES,
  detectUserRole,
} from '../config/constants/roles';

export default function useSession() {

  /**
   * =========================================================
   * GET SESSION
   * =========================================================
   */

  const getSession =
    useCallback(() => {

      try {

        const rawSession =
          localStorage.getItem(
            STORAGE_KEYS.SESSION
          );

        if (!rawSession) {

          return null;

        }

        const parsedSession =
          JSON.parse(rawSession);

        /**
         * VALIDATE SESSION
         */

        if (
          !parsedSession?.employeeId
        ) {

          return null;

        }

        return parsedSession;

      } catch (error) {

        console.error(
          'Failed to parse session:',
          error
        );

        return null;

      }

    }, []);

  /**
   * =========================================================
   * SAVE SESSION
   * =========================================================
   */

  const saveSession =
    useCallback((sessionData) => {

      try {

        /**
         * AUTO ROLE DETECTION
         */

        const role =
          detectUserRole(
            sessionData.employeeId
          );

        /**
         * FINAL SESSION PAYLOAD
         */

        const finalSession = {

          ...sessionData,

          role,

          lastLoginAt:
            new Date().toISOString(),

        };

        localStorage.setItem(
          STORAGE_KEYS.SESSION,
          JSON.stringify(
            finalSession
          )
        );

      } catch (error) {

        console.error(
          'Failed to save session:',
          error
        );

      }

    }, []);

  /**
   * =========================================================
   * UPDATE SESSION
   * =========================================================
   */

  const updateSession =
    useCallback((updates) => {

      try {

        const currentSession =
          getSession();

        if (!currentSession) {

          return;

        }

        /**
         * RE-DETECT ROLE IF EMPLOYEE ID CHANGED
         */

        const employeeId =
          updates.employeeId ||
          currentSession.employeeId;

        const updatedSession = {

          ...currentSession,

          ...updates,

          role:
            detectUserRole(
              employeeId
            ),

          updatedAt:
            new Date().toISOString(),

        };

        saveSession(
          updatedSession
        );

      } catch (error) {

        console.error(
          'Failed to update session:',
          error
        );

      }

    }, [
      getSession,
      saveSession,
    ]);

  /**
   * =========================================================
   * CLEAR SESSION
   * =========================================================
   */

  const clearSession =
    useCallback(() => {

      localStorage.removeItem(
        STORAGE_KEYS.SESSION
      );

    }, []);

  /**
   * =========================================================
   * AUTH CHECK
   * =========================================================
   */

  const isAuthenticated =
    useCallback(() => {

      return !!getSession();

    }, [getSession]);

  /**
   * =========================================================
   * EXECUTIVE CHECK
   * =========================================================
   */

  const isExecutive =
    useCallback(() => {

      const session =
        getSession();

      return (
        session?.role ===
        ROLES.EXECUTIVE
      );

    }, [getSession]);

  /**
   * =========================================================
   * OPERATOR CHECK
   * =========================================================
   */

  const isOperator =
    useCallback(() => {

      const session =
        getSession();

      return (
        session?.role ===
        ROLES.OPERATOR
      );

    }, [getSession]);

  return {

    /**
     * SESSION
     */

    getSession,
    saveSession,
    updateSession,
    clearSession,

    /**
     * AUTH
     */

    isAuthenticated,

    /**
     * ROLE
     */

    isExecutive,
    isOperator,

  };
}
