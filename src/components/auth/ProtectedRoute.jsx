import { Navigate, useLocation } from 'react-router-dom';

import { STORAGE_KEYS } from '../../config/constants/storageKeys';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  /**
   * Get session from localStorage
   */
  const session = localStorage.getItem(
    STORAGE_KEYS.SESSION
  );

  /**
   * No session → redirect to login
   */
  if (!session) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  let user;

  /**
   * Safely parse session
   */
  try {
    user = JSON.parse(session);
  } catch (error) {
    console.error(
      'Invalid session data:',
      error
    );

    localStorage.removeItem(
      STORAGE_KEYS.SESSION
    );

    return <Navigate to="/" replace />;
  }

  /**
   * Invalid or corrupted user
   */
  if (!user?.id) {
    localStorage.removeItem(
      STORAGE_KEYS.SESSION
    );

    return <Navigate to="/" replace />;
  }

  /**
   * Valid session → render page
   */
  return children;
}
