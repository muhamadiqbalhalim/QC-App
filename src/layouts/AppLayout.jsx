import React from 'react';

import Sidebar from '../components/dashboard/Sidebar';

import useSession from '../hooks/useSession';

export default function AppLayout({
  children,
}) {

  const {
    clearSession,
  } = useSession();

  const handleLogout = () => {

    clearSession();

    window.location.href = '/';

  };

  return (
    <div
      className="
        min-h-screen
        flex
      "
    >

      {/* SIDEBAR */}
      <Sidebar
        onLogout={handleLogout}
      />

      {/* PAGE CONTENT */}
        <main
        className="
            flex-1
            overflow-y-auto
            overflow-x-hidden
            min-w-0
        "
        >
        {children}
      </main>

    </div>
  );
}