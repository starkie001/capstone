import { NextResponse } from 'next/server';
import { UserController } from '@/lib/controllers/UserController';
import { validateRegistrationSecurity } from '@/lib/security/registrationSecurity';

const userController = new UserController();

// Simple in-memory rate limiting (for production, use Redis or database)
const registrationAttempts = new Map();
const MAX_ATTEMPTS = 3; // Max 3 registrations per IP per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getRateLimitKey(request) {
    // In production, you might want to use a more sophisticated approach
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return ip;
}

function isRateLimited(key) {
    const now = Date.now();
    const attempts = registrationAttempts.get(key) || [];
    
    // Remove attempts older than the window
    const validAttempts = attempts.filter(time => now - time < WINDOW_MS);
    
    if (validAttempts.length >= MAX_ATTEMPTS) {
        return true;
    }
    
    // Add current attempt
    validAttempts.push(now);
    registrationAttempts.set(key, validAttempts);
    
    return false;
}

// POST /api/auth/register - Public user registration
export async function POST(request) {
    try {
        console.log('[API] POST /api/auth/register - Registration request received');
        
        // Rate limiting check
        const rateLimitKey = getRateLimitKey(request);
        if (isRateLimited(rateLimitKey)) {
            console.log(`[API] POST /api/auth/register - Rate limit exceeded for: ${rateLimitKey}`);
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                { status: 429 }
            );
        }
        
        const userData = await request.json();
        console.log(`[API] POST /api/auth/register - Registering user with email: ${userData.email}`);

        // Enhanced security validation
        const securityErrors = validateRegistrationSecurity(userData, request);
        if (securityErrors.length > 0) {
            console.log(`[API] POST /api/auth/register - Security validation failed: ${securityErrors[0]}`);
            return NextResponse.json(
                { error: securityErrors[0] },
                { status: 400 }
            );
        }

        // Uncomment when ready to use reCAPTCHA
        // // Verify reCAPTCHA
        // if (userData.recaptchaToken) {
        //     const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded',
        //         },
        //         body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${userData.recaptchaToken}`
        //     });

        //     const recaptchaData = await recaptchaResponse.json();
            
        //     if (!recaptchaData.success) {
        //         console.log('[API] POST /api/auth/register - reCAPTCHA verification failed');
        //         return NextResponse.json(
        //             { error: 'reCAPTCHA verification failed. Please try again.' },
        //             { status: 400 }
        //         );
        //     }
            
        //     console.log('[API] POST /api/auth/register - reCAPTCHA verification successful');
        // } else {
        //     console.log('[API] POST /api/auth/register - No reCAPTCHA token provided');
        //     return NextResponse.json(
        //         { error: 'reCAPTCHA verification required' },
        //         { status: 400 }
        //     );
        // }

        // Validate required fields
        if (!userData.name || !userData.email || !userData.password) {
            console.log('[API] POST /api/auth/register - Missing required fields');
            return NextResponse.json(
                { error: 'Missing required fields', required: ['name', 'email', 'password'] },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            console.log(`[API] POST /api/auth/register - Invalid email format: ${userData.email}`);
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password length
        if (userData.password.length < 6) {
            console.log(`[API] POST /api/auth/register - Password too short for: ${userData.email}`);
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Set default values for new user registration
        const newUserData = {
            ...userData,
            role: userData.role || "guest", // Default role
            status: "active" // New users are active by default
        };

        const newUser = await userController.createUser(newUserData);
        console.log(`[API] POST /api/auth/register - User registered successfully with ID: ${newUser.id}`);

        return NextResponse.json({ 
            success: true, 
            data: newUser,
            message: 'User registered successfully. Please sign in to continue.' 
        }, { status: 201 });

    } catch (error) {
        console.error('[API] POST /api/auth/register - Error occurred:', error);
        
        // Handle specific error cases
        if (error.message.includes('already exists')) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
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
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}