import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * =========================================================
 * THEME STORAGE KEY
 * =========================================================
 * Centralized key for theme persistence.
 *
 * FUTURE IMPROVEMENT:
 * Move this into:
 * src/config/constants/storageKeys.js
 * =========================================================
 */
const THEME_STORAGE_KEY = 'p2sa_theme';

/**
 * =========================================================
 * THEME CONTEXT
 * =========================================================
 * Global theme state manager.
 *
 * RESPONSIBILITIES:
 * - Manage dark/light mode
 * - Persist theme into localStorage
 * - Sync Tailwind dark class
 * - Provide centralized theme access
 * =========================================================
 */
const ThemeContext = createContext(null);

/**
 * =========================================================
 * THEME PROVIDER
 * =========================================================
 * Wraps the entire application.
 *
 * EXAMPLE:
 * <ThemeProvider>
 *    <App />
 * </ThemeProvider>
 * =========================================================
 */
export function ThemeProvider({ children }) {

  /**
   * =========================================================
   * INITIAL THEME STATE
   * =========================================================
   * Reads persisted theme from localStorage.
   *
   * DEFAULT:
   * - light mode
   * =========================================================
   */
  const [darkMode, setDarkMode] = useState((false) => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

      return savedTheme === 'dark';

    } catch (error) {
      console.error('Failed to initialize theme:', error);

      return false;
    }
  });

  /**
   * =========================================================
   * SYNC THEME
   * =========================================================
   * Updates:
   * - localStorage
   * - DOM dark class
   * =========================================================
   */
  useEffect(() => {
    try {

      /**
       * Persist theme
       */
      localStorage.setItem(
        THEME_STORAGE_KEY,
        darkMode ? 'dark' : 'light'
      );

      /**
       * Sync Tailwind dark mode class
       */
      document.documentElement.classList.toggle(
        'dark',
        darkMode
      );

    } catch (error) {
      console.error('Failed to sync theme:', error);
    }
  }, [darkMode]);

  /**
   * =========================================================
   * TOGGLE THEME
   * =========================================================
   * Cleaner reusable toggle handler.
   * =========================================================
   */
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  /**
   * =========================================================
   * MEMOIZED CONTEXT VALUE
   * =========================================================
   * Prevent unnecessary re-renders.
   * =========================================================
   */
  const contextValue = useMemo(() => ({
    darkMode,
    setDarkMode,
    toggleTheme,
  }), [darkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * =========================================================
 * USE THEME HOOK
 * =========================================================
 * Centralized theme consumer hook.
 *
 * EXAMPLE:
 * const { darkMode, toggleTheme } = useTheme();
 * =========================================================
 */
export function useTheme() {

  const context = useContext(ThemeContext);

  /**
   * Safety protection.
   */
  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider'
    );
  }

  return context;
}