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
import TrainingHistory from './pages/TrainingHistory';

import ProtectedRoute from './components/auth/ProtectedRoute';

import AppLayout from './layouts/AppLayout';

import useSession from './hooks/useSession';

import ReviewForm from './pages/ReviewForm';

import ReviewSubmission from './pages/ReviewSubmission';

export default function App() {

  /**
   * =========================================================
   * SESSION
   * =========================================================
   */

  const {
    getSession,
    isAuthenticated,
  } = useSession();

  /**
   * =========================================================
   * USER
   * =========================================================
   */

  const [user, setUser] =
    useState(() =>
      getSession()
    );

  /**
   * =========================================================
   * SYNC SESSION
   * =========================================================
   */

  useEffect(() => {

    const session =
      getSession();

    if (session) {

      setUser(session);

    }

  }, [getSession]);

  return (
    <div
      className="
        min-h-dvh
        w-full
        overflow-hidden
        transition-colors
        duration-300
        bg-[#F8FAFC]
        text-slate-900
      "
    >

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      {!isAuthenticated() ? (

        <Routes>

          {/* LOGIN */}
          <Route
            path="/"
            element={
              <Login
                onLoginSuccess={
                  setUser
                }
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

        /* ===================================================
            AUTHENTICATED ROUTES
        =================================================== */

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

          <Route
            path="/review-form"
            element={
              <ProtectedRoute>

                <AppLayout>

                  <ReviewForm />

                </AppLayout>

              </ProtectedRoute>
            }
          />

          <Route
            path="/review/:submissionId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReviewSubmission />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* TRAINING HISTORY */}
          <Route
            path="/history"
            element={
              <ProtectedRoute>

                <AppLayout>

                  <TrainingHistory />

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