"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
    const { data: session } = useSession()

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" href="/">My App</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" href="/">Home</Link>
                        </li>

                        {session && session.user?.role === "admin" && (
                            <li className="nav-item">
                                <Link className="nav-link" href="/admin">Admin</Link>
                            </li>
                        )}

                        {session && (
                            <li className="nav-item">
                                <Link className="nav-link" href="/account">Account</Link>
                            </li>
                        )}

                        {!session ? (
                            <li className="nav-item">
                                <Link className="nav-link" href="/auth/signin">Login</Link>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <button
                                    className="btn btn-outline-light ms-2"
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
    )
}