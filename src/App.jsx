import {
  lazy,
  Suspense,
  useState,
} from 'react';

import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import useSession from './hooks/useSession';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WisFormRegistration = lazy(() => import('./pages/WisFormRegistration'));
const TrainingHistory = lazy(() => import('./pages/TrainingHistory'));
const MyTrainings = lazy(() => import('./pages/MyTrainings'));
const TrainingAttendance = lazy(() => import('./pages/TrainingAttendance'));
const MyInspectionForms = lazy(() => import('./pages/MyInspectionForms'));
const ReviewForm = lazy(() => import('./pages/ReviewForm'));
const ReviewSubmission = lazy(() => import('./pages/ReviewSubmission'));

function RouteFallback() {
  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#F8FAFC]
        text-slate-900
      "
    >
      <div
        className="
          w-12
          h-12
          border-4
          border-amber-500/20
          border-t-amber-500
          rounded-full
          animate-spin
        "
      />
    </div>
  );
}

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

        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>

      ) : (

        /* ===================================================
            AUTHENTICATED ROUTES
        =================================================== */

        <Suspense fallback={<RouteFallback />}>
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
            path="/my-trainings"
            element={
              <ProtectedRoute>

                <AppLayout>

                  <MyTrainings
                    user={user}
                  />

                </AppLayout>

              </ProtectedRoute>
            }
          />

          <Route
            path="/training-attendance"
            element={
              <ProtectedRoute>

                <AppLayout>

                  <TrainingAttendance />

                </AppLayout>

              </ProtectedRoute>
            }
          />

          <Route
            path="/inspection-forms"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MyInspectionForms />
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
        </Suspense>

      )}

    </div>
  );
}
