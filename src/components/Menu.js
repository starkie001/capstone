import Link from 'next/link';
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from 'react';

export default function Menu({ isOpen, onShowSignIn }) {
  const { data: session } = useSession();
  const [showAdminSub, setShowAdminSub] = useState(false);
  const [showMembersSub, setShowMembersSub] = useState(false);
  const [bookingsActive, setBookingsActive] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/obs-availability-settings");
        if (res.ok) {
          const data = await res.json();
          setBookingsActive(data.bookingsActive);
        }
      } catch {}
    }
    fetchSettings();
  }, []);

  return (
    <aside className={`side-menu ${isOpen ? 'visible' : ''}`}>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/whats-on">What&apos;s On</Link></li>
        <li>
          <button
            className="menu-btn"
            onClick={() => {
              if (!session) {
                if (typeof onShowSignIn === "function") {
                  onShowSignIn();
                }
              } else {
                window.location.href = "/bookings";
              }
            }}
          >
            Private Bookings
          </button>
        </li>
        <li><Link href="/bookings">View Bookings</Link></li>
        {bookingsActive && (
          <li><Link href="/bookings/new">Make a Booking</Link></li>
        )}
        {session && (session.user?.role === "member" || session.user?.role === "admin" || session.user?.role === "leader") && (
          <>
            <li><button className="menu-btn" onClick={() => setShowMembersSub(v => !v)} aria-expanded={showMembersSub} aria-controls="members-submenu">Members</button></li>
            {showMembersSub && (
              <ul id="members-submenu" style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                <li><Link href="/members/hosting">Hosting</Link></li>
              </ul>
            )}
          </>
        )}
        {session && session.user?.role === "admin" && (
        <>
          <li><button className="menu-btn" onClick={() => setShowAdminSub(v => !v)} aria-expanded={showAdminSub} aria-controls="admin-submenu">Admin</button></li>
        {showAdminSub && (
          <ul id="admin-submenu" style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
            <li><Link href="/admin/users">User Management</Link></li>
            <li><Link href="/admin/settings">Obs. Availability</Link></li>
          </ul>
        )}
        </>
      )}
        <li><Link href="/contact">Contact</Link></li>
        <li><Link href="/links">Links</Link></li>
        <li><Link href="/gallery">Gallery</Link></li>
        {!session ? (
          <li><button onClick={onShowSignIn} className="menu-btn">Log In</button></li>
        ) : (
          <li><button onClick={() => signOut()} className="menu-btn">Log Out</button></li>
        )}
      </ul>
    </aside>
  );
}
