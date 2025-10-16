
"use client"

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function AppHeader() {
  const { data: session } = useSession();
  const [showAdminSub, setShowAdminSub] = useState(false);
  const [showMembersSub, setShowMembersSub] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Only enable navbar toggling after client mount to avoid SSR mismatch
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link href="/" className="logo-container">
          <div className="sparkle-wrapper">
            <Image
              src="/npas-logo.png"
              alt="NPAS Logo"
              width={180}
              height={60}
            />
          </div>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          aria-controls="navbarNav"
          aria-expanded={isClient ? showNav : false}
          onClick={() => isClient && setShowNav(v => !v)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`navbar-collapse collapse${isClient && showNav ? ' show' : ''}`} id="navbarNav">
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            style={{position: 'absolute', top: '1rem', right: '1rem', color: 'white', background: 'none', border: 'none', fontSize: '2rem', zIndex: 101}}
            onClick={() => isClient && setShowNav(false)}
          >
            &times;
          </button>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/whats-on">What&apos;s On</Link>
            </li>
            <li className="nav-item">
              <button
                className="nav-link"
                style={{ padding: 0, border: 'none', background: 'none', color: 'inherit', fontWeight: 'inherit' }}
                onClick={() => {
                  if (!session) {
                    window.location.href = "/auth/signin";
                  } else {
                    window.location.href = "/bookings";
                  }
                }}
              >
                Private Bookings
              </button>
            </li>
           {session && (session.user?.role === "member" || session.user?.role === "admin" || session.user?.role === "leader") && (
          <>
            <li className="nav-item">
              <button className="nav-link" style={{ padding: 0, border: 'none', background: 'none', color: 'inherit', fontWeight: 'inherit' }} onClick={() => setShowMembersSub(v => !v)} aria-expanded={showMembersSub} aria-controls="members-submenu">Members</button>
            </li>
            {showMembersSub && (
              <ul id="members-submenu" style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                <li><Link href="/members/hosting">Hosting</Link></li>
              </ul>
            )}
          </>
        )}
        {session && session.user?.role === "admin" && (
                <>
                  <li className="nav-item">
                    <button className="nav-link" style={{ padding: 0, border: 'none', background: 'none', color: 'inherit', fontWeight: 'inherit' }} onClick={() => setShowAdminSub(v => !v)} aria-expanded={showAdminSub} aria-controls="admin-submenu">Admin</button>
                  </li>
                {showAdminSub && (
                  <ul id="admin-submenu" style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                    <li><Link href="/admin/users">User Management</Link></li>
                    <li><Link href="/admin/obs-availability">Obs. Availability</Link></li>
                  </ul>
                )}
                </>
              )}
            {!session ? (
              <li className="nav-item">
                <Link className="nav-link" href="/auth/signin">
                  Login
                </Link>
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="nav-link"
                  style={{ padding: 0, border: 'none', background: 'none', color: 'inherit', fontWeight: 'inherit' }}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
