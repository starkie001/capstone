import { requireAdmin } from "../../../auth-helpers"
import { UserController } from "../../../lib/controllers/UserController"
import DeleteButton from "./DeleteButton"

const userController = new UserController();

export default async function UsersPage() {
  console.log('[Admin Users Page] Loading users page');
  
  // Check authentication and authorization
  // Note: This will redirect if user is not admin
  await requireAdmin();

  let users = [];
  
  try {
    // Get all users from database
    users = await userController.getAllUsers();
    console.log(`[Admin Users Page] Loaded ${users.length} users`);
  } catch (error) {
    console.error('[Admin Users Page] Error loading users:', error);
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error Loading Users</h4>
          <p>There was an error loading the user data. Please try again.</p>
          <small className="text-muted">Error: {error.message}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Management</h1>
        <div className="text-muted">
          Total Users: {users.length}
        </div>
      </div>
      
      {users.length === 0 ? (
        <div className="alert alert-info">
          No users found in the system.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Profile</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={`${user.name}'s profile`} 
                        className="rounded-circle" 
                        width="40" 
                        height="40" 
                      />
                    ) : (
                      <div className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center" 
                           style={{ width: '40px', height: '40px' }}>
                        <span className="text-white fw-bold">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.role === 'admin' ? 'bg-danger' :
                      user.role === 'lead_host' ? 'bg-warning text-dark' :
                      user.role === 'member' ? 'bg-success' :
                      user.role === 'guest' ? 'bg-primary' :
                      'bg-secondary'
                    }`}>
                      {user.role === 'lead_host' ? 'Lead Host' :
                       user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.status === 'active' ? 'bg-success' : 
                      user.status === 'inactive' ? 'bg-warning' : 'bg-danger'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.dateCreated ? 
                      new Date(user.dateCreated).toLocaleDateString() : 
                      'N/A'
                    }
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <a 
                        href={`/admin/users/edit/${user.id}`}
                        className="btn btn-sm btn-outline-primary"
                        title={`Edit ${user.name}`}
                      >
                        <span>✏️</span> Edit
                      </a>
                      <DeleteButton user={user} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}