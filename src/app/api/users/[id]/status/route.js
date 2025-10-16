import { NextResponse } from 'next/server';
import { UserController } from '@/lib/controllers/UserController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

const userController = new UserController();

// PUT /api/users/[id]/status - Update user status (active/inactive/suspended)
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        console.log(`[API] PUT /api/users/${id}/status - Request received`);
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log(`[API] PUT /api/users/${id}/status - Unauthorized access attempt`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admin can change user status
        if (session.user.role !== 'admin') {
            console.log(`[API] PUT /api/users/${id}/status - Non-admin user attempted to change status: ${session.user.email}`);
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { status } = await request.json();
        
        // Validate status value
        if (!status) {
            console.log(`[API] PUT /api/users/${id}/status - Missing status in request`);
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            console.log(`[API] PUT /api/users/${id}/status - Invalid status provided: ${status}`);
            return NextResponse.json(
                { error: 'Invalid status. Must be active, inactive, or suspended' },
                { status: 400 }
            );
        }

        // Prevent admin from suspending themselves
        const requestedUserId = id;
        const sessionUserId = session.user.id;
        
        if (sessionUserId === requestedUserId && status !== 'active') {
            console.log(`[API] PUT /api/users/${id}/status - Admin attempted to deactivate themselves`);
            return NextResponse.json({ 
                error: 'Cannot deactivate your own account' 
            }, { status: 400 });
        }

        const updatedUser = await userController.changeUserStatus(id, status);
        if (!updatedUser) {
            console.log(`[API] PUT /api/users/${id}/status - User not found`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`[API] PUT /api/users/${id}/status - Status updated successfully to: ${status}`);
        return NextResponse.json({ 
            success: true, 
            data: updatedUser,
            message: `User status updated to ${status}` 
        });

    } catch (error) {
        console.error(`[API] PUT /api/users/${params?.id}/status - Error occurred:`, error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}