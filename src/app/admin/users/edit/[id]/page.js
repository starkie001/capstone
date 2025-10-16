import { requireAdmin } from "../../../../../auth-helpers"
import { UserController } from "../../../../../lib/controllers/UserController"
import { notFound } from "next/navigation"
import EditUserForm from "./EditUserForm"

const userController = new UserController();

export default async function EditUserPage({ params }) {

  const { id } = await params;

  console.log('[Edit User Page] Loading edit page for user ID:', id);
  
  // Check authentication and authorization
  await requireAdmin();

  let user = null;
  
  try {
    // Get user data
    user = await userController.getUserById(id);
    
    if (!user) {
      console.log(`[Edit User Page] User not found with ID: ${id}`);
      notFound();
    }
    
    console.log(`[Edit User Page] Loaded user: ${user.email}`);
  } catch (error) {
    console.error('[Edit User Page] Error loading user:', error);
    notFound();
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="d-flex align-items-center mb-4">
            <a 
              href="/admin/users" 
              className="btn btn-outline-secondary me-3"
              title="Back to Users"
            >
              ← Back
            </a>
            <h1 className="mb-0">Edit User</h1>
          </div>
          
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center mb-4">
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={`${user.name}'s profile`} 
                    className="rounded-circle mb-3" 
                    width="80" 
                    height="80" 
                  />
                ) : (
                  <div className="rounded-circle bg-secondary mx-auto mb-3 d-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px' }}>
                    <span className="text-white fw-bold fs-3">
                      {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <h4>{user.name}</h4>
                <p className="text-muted">{user.email}</p>
              </div>

              <EditUserForm user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}