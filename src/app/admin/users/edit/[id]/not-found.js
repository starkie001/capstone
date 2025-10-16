export default function NotFound() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="text-center">
            <h1 className="display-1 fw-bold text-muted">404</h1>
            <h2 className="mb-3">User Not Found</h2>
            <p className="mb-4 text-muted">
              The user you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <div>
              <a href="/admin/users" className="btn btn-primary me-2">
                Back to Users
              </a>
              <a href="/admin" className="btn btn-outline-secondary">
                Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}