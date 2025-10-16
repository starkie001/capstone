import { NextResponse } from 'next/server';
import { UserController } from '@/lib/controllers/UserController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

const userController = new UserController();

// GET /api/users - Get all users or filter by role
export async function GET(request) {
    try {
        console.log('[API] GET /api/users - Request received');
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log('[API] GET /api/users - Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin for accessing all users
        if (session.user.role !== 'admin') {
            console.log(`[API] GET /api/users - Non-admin user attempted access: ${session.user.email}`);
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        let users;
        if (role) {
            console.log(`[API] GET /api/users - Fetching users by role: ${role}`);
            users = await userController.getUsersByRole(role);
        } else {
            console.log('[API] GET /api/users - Fetching all users');
            users = await userController.getAllUsers();
        }

        console.log(`[API] GET /api/users - Successfully returned ${users.length} users`);
        return NextResponse.json({ 
            success: true, 
            data: users,
            count: users.length 
        });

    } catch (error) {
        console.error('[API] GET /api/users - Error occurred:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// POST /api/users - Create a new user
export async function POST(request) {
    try {
        console.log('[API] POST /api/users - Request received');
        
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log('[API] POST /api/users - Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin for creating users
        if (session.user.role !== 'admin') {
            console.log(`[API] POST /api/users - Non-admin user attempted to create user: ${session.user.email}`);
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const userData = await request.json();
        console.log(`[API] POST /api/users - Creating user with email: ${userData.email}`);

        // Validate required fields
        if (!userData.name || !userData.email || !userData.password) {
            console.log('[API] POST /api/users - Missing required fields');
            return NextResponse.json(
                { error: 'Missing required fields', required: ['name', 'email', 'password'] },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            console.log(`[API] POST /api/users - Invalid email format: ${userData.email}`);
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const newUser = await userController.createUser(userData);
        console.log(`[API] POST /api/users - User created successfully with ID: ${newUser.id}`);

        return NextResponse.json({ 
            success: true, 
            data: newUser,
            message: 'User created successfully' 
        }, { status: 201 });

    } catch (error) {
        console.error('[API] POST /api/users - Error occurred:', error);
        
        // Handle specific error cases
        if (error.message.includes('already exists')) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }
        
        if (error.message.includes('required')) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/users - Bulk update users (if needed)
export async function PUT(request) {
    try {
        console.log('[API] PUT /api/users - Bulk update not implemented');
        return NextResponse.json(
            { error: 'Bulk update not implemented. Use /api/users/[id] for individual updates' },
            { status: 501 }
        );
    } catch (error) {
        console.error('[API] PUT /api/users - Error occurred:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/users - Bulk delete users (if needed)
export async function DELETE(request) {
    try {
        console.log('[API] DELETE /api/users - Bulk delete not implemented');
        return NextResponse.json(
            { error: 'Bulk delete not implemented. Use /api/users/[id] for individual deletes' },
            { status: 501 }
        );
    } catch (error) {
        console.error('[API] DELETE /api/users - Error occurred:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
