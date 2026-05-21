import React, {
  useEffect,
  useState,
} from 'react';

import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WisTrainingOG from './pages/WisTrainingOG';
import WisFormRegistration from './pages/WisFormRegistration';

import ProtectedRoute from './components/auth/ProtectedRoute';

import AppLayout from './layouts/AppLayout';

import { useTheme } from './context/ThemeContext';
import useSession from './hooks/useSession';

export default function App() {

  const { darkMode } = useTheme();

  const {
    getSession,
    isAuthenticated,
  } = useSession();

  /**
   * Current session user
   */
  const [user, setUser] = useState(() =>
    getSession()
  );

  /**
   * Sync session after refresh
   */
  useEffect(() => {
    const session = getSession();

    if (session) {
      setUser(session);
    }
  }, [getSession]);

  return (
    <div
      className={`
        min-h-screen
        w-screen
        overflow-hidden
        transition-colors
        duration-300
        ${
          darkMode
            ? 'bg-[#0F172A] text-slate-100'
            : 'bg-[#F8FAFC] text-slate-900'
        }
      `}
    >
      {/* ============================================== */}
      {/* PUBLIC ROUTES */}
      {/* ============================================== */}
      {!isAuthenticated() ? (
        <Routes>

          {/* LOGIN */}
          <Route
            path="/"
            element={
              <Login
                onLoginSuccess={setUser}
              />
            }
          />

          {/* FALLBACK */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      ) : (
        /* ============================================ */
        /* AUTHENTICATED ROUTES */
        /* ============================================ */
        <Routes>

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard
                    user={user}
                  />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* WIS TRAINING OG */}
          <Route
            path="/training-og"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <WisTrainingOG />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* TRAINING FORM */}
          <Route
            path="/registration/:trainingId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <WisFormRegistration />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* DEFAULT */}
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* FALLBACK */}
          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}