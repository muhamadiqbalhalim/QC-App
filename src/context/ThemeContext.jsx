import React, {
  createContext,
  useContext,
  useMemo,
} from 'react';

const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {

  const darkMode = false;

  const setDarkMode = () => {};

  /**
   * =========================================================
   * TOGGLE THEME
   * =========================================================
   * Cleaner reusable toggle handler.
   * =========================================================
   */
  const toggleTheme = () => {};

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