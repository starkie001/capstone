import { NextResponse } from 'next/server';
import { UserController } from '@/lib/controllers/UserController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

const userController = new UserController();

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        console.log(`[API] GET /api/users/${id} - Request received`);
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log(`[API] GET /api/users/${id} - Unauthorized access attempt`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Users can only access their own profile unless they are admin
        const requestedUserId = id;
        const sessionUserId = session.user.id;
        
        if (session.user.role !== 'admin' && sessionUserId !== requestedUserId) {
            console.log(`[API] GET /api/users/${id} - User ${session.user.email} attempted to access user ${id}`);
            return NextResponse.json({ error: 'Forbidden - Can only access own profile' }, { status: 403 });
        }

        const user = await userController.getUserById(id);
        if (!user) {
            console.log(`[API] GET /api/users/${id} - User not found`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`[API] GET /api/users/${id} - User found successfully`);
        return NextResponse.json({ 
            success: true, 
            data: user 
        });

    } catch (error) {
        console.error(`[API] GET /api/users/${params?.id} - Error occurred:`, error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update user by ID
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        console.log(`[API] PUT /api/users/${id} - Request received`);
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log(`[API] PUT /api/users/${id} - Unauthorized access attempt`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updateData = await request.json();
        const requestedUserId = id;
        const sessionUserId = session.user.id;

        // Users can only update their own profile unless they are admin
        if (session.user.role !== 'admin' && sessionUserId !== requestedUserId) {
            console.log(`[API] PUT /api/users/${id} - User ${session.user.email} attempted to update user ${id}`);
            return NextResponse.json({ error: 'Forbidden - Can only update own profile' }, { status: 403 });
        }

        // Non-admin users cannot change role or status
        if (session.user.role !== 'admin') {
            if (updateData.role || updateData.status) {
                console.log(`[API] PUT /api/users/${id} - Non-admin user attempted to change role/status`);
                return NextResponse.json({ 
                    error: 'Forbidden - Cannot change role or status' 
                }, { status: 403 });
            }
        }

        // Validate email format if provided
        if (updateData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updateData.email)) {
                console.log(`[API] PUT /api/users/${id} - Invalid email format: ${updateData.email}`);
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await userController.updateUser(id, updateData);
        if (!updatedUser) {
            console.log(`[API] PUT /api/users/${id} - User not found for update`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`[API] PUT /api/users/${id} - User updated successfully`);
        return NextResponse.json({ 
            success: true, 
            data: updatedUser,
            message: 'User updated successfully' 
        });

    } catch (error) {
        console.error(`[API] PUT /api/users/${params?.id} - Error occurred:`, error);
        
        // Handle specific error cases
        if (error.message.includes('Email already exists')) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Delete user by ID
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        console.log(`[API] DELETE /api/users/${id} - Request received`);
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log(`[API] DELETE /api/users/${id} - Unauthorized access attempt`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admin can delete users
        if (session.user.role !== 'admin') {
            console.log(`[API] DELETE /api/users/${id} - Non-admin user attempted to delete user: ${session.user.email}`);
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        // Prevent admin from deleting themselves
        const requestedUserId = id;
        const sessionUserId = session.user.id;
        
        if (sessionUserId === requestedUserId) {
            console.log(`[API] DELETE /api/users/${id} - Admin attempted to delete themselves`);
            return NextResponse.json({ 
                error: 'Cannot delete your own account' 
            }, { status: 400 });
        }

        const deletedUser = await userController.deleteUser(id);
        if (!deletedUser) {
            console.log(`[API] DELETE /api/users/${id} - User not found for deletion`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`[API] DELETE /api/users/${id} - User deleted successfully`);
        return NextResponse.json({ 
            success: true, 
            data: deletedUser,
            message: 'User deleted successfully' 
        });

    } catch (error) {
        console.error(`[API] DELETE /api/users/${params?.id} - Error occurred:`, error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}