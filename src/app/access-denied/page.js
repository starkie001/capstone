"use client"

import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="alert alert-danger text-center">
            <h2 className="mb-3">🚫 Access Denied</h2>
            <p className="mb-3">
              You don&apos;t have permission to access this page. 
              This area is restricted to administrators only.
            </p>
            <Link href="/" className="btn btn-primary me-2">
              Go Home
            </Link>
            <a href="/auth/signin" className="btn btn-outline-secondary">
              Sign In as Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}