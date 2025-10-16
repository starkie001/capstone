# reCAPTCHA Integration Guide for Next.js Authentication

This guide explains how to integrate Google reCAPTCHA v2 into your Next.js authentication system to prevent bot registrations.

## Prerequisites

- Next.js app with authentication system
- Registration form (`/auth/signup`)
- Registration API endpoint (`/api/auth/register`)

## Step 1: Get reCAPTCHA Keys from Google

### 1.1 Register Your Site
1. Visit: https://www.google.com/recaptcha/admin/create
2. Click **"+"** to create a new site
3. Fill in the form:
   - **Label**: Your app name (e.g., "My Next.js App")
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - `your-production-domain.com` (for production)
   - **Accept the terms** and click **Submit**

### 1.2 Save Your Keys
After registration, you'll get two keys:
- **Site Key** (public): Used in frontend
- **Secret Key** (private): Used in backend

⚠️ **Important**: Never expose the Secret Key in client-side code!

## Step 2: Update Environment Variables

Add the following to your `.env.local` file:

```env
# Existing variables (keep these)
NEXTAUTH_SECRET=your-existing-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NEW: reCAPTCHA keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-public-site-key-here
RECAPTCHA_SECRET_KEY=your-private-secret-key-here
```

**Key Points:**
- `NEXT_PUBLIC_` prefix makes the site key available in the browser
- Secret key has no prefix (server-side only)

## Step 3: Install reCAPTCHA Package

```bash
npm install react-google-recaptcha
```

## Step 4: Update Sign-Up Form Component

Update your `src/app/auth/signup/page.js`:

```javascript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ReCAPTCHA from "react-google-recaptcha"  // NEW IMPORT

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaValue, setCaptchaValue] = useState(null)  // NEW STATE
  const router = useRouter()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    // NEW: reCAPTCHA validation
    if (!captchaValue) {
      setError("Please complete the reCAPTCHA")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "customer",
          recaptchaToken: captchaValue  // NEW: Include reCAPTCHA token
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/auth/signin?message=Registration successful! Please sign in.')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="mb-4">Sign Up</h1>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* NEW: reCAPTCHA Component */}
            <div className="mb-3">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={setCaptchaValue}
                onExpired={() => setCaptchaValue(null)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center mt-3">
            <p>
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-decoration-none">
                Sign In
              </Link>
            </p>
          </div>

          <div className="text-center mt-3">
            <p className="text-muted">
              <small>Or continue with Google on the sign-in page</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Step 5: Update Registration API Endpoint

Update your `src/app/api/auth/register/route.js` to verify the reCAPTCHA token:

```javascript
import { NextResponse } from 'next/server';
import { UserController } from '@/lib/controllers/UserController';
import { validateRegistrationSecurity } from '@/lib/security/registrationSecurity';

const userController = new UserController();

// Rate limiting (existing code)
const registrationAttempts = new Map();
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000;

function getRateLimitKey(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return ip;
}

function isRateLimited(key) {
    const now = Date.now();
    const attempts = registrationAttempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < WINDOW_MS);
    
    if (validAttempts.length >= MAX_ATTEMPTS) {
        return true;
    }
    
    validAttempts.push(now);
    registrationAttempts.set(key, validAttempts);
    return false;
}

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

        // NEW: Verify reCAPTCHA
        if (userData.recaptchaToken) {
            const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${userData.recaptchaToken}`
            });

            const recaptchaData = await recaptchaResponse.json();
            
            if (!recaptchaData.success) {
                console.log('[API] POST /api/auth/register - reCAPTCHA verification failed');
                return NextResponse.json(
                    { error: 'reCAPTCHA verification failed. Please try again.' },
                    { status: 400 }
                );
            }
            
            console.log('[API] POST /api/auth/register - reCAPTCHA verification successful');
        } else {
            console.log('[API] POST /api/auth/register - No reCAPTCHA token provided');
            return NextResponse.json(
                { error: 'reCAPTCHA verification required' },
                { status: 400 }
            );
        }

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
            role: userData.role || "customer",
            status: "active"
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
```

## Step 6: Restart Development Server

After adding environment variables, restart your development server:

```bash
npm run dev
```

## Step 7: Test the Implementation

1. **Navigate to your sign-up page**: `http://localhost:3000/auth/signup`
2. **Fill out the form** with valid information
3. **Complete the reCAPTCHA** by checking "I'm not a robot"
4. **Submit the form** and verify it works
5. **Test failure cases**:
   - Try submitting without completing reCAPTCHA
   - Try submitting with invalid data

## Optional: Development Mode Skip

For easier development, you can temporarily skip reCAPTCHA validation:

```javascript
// In your API route, add this condition:
if (process.env.NODE_ENV === 'development' && !userData.recaptchaToken) {
    console.log('[API] Skipping reCAPTCHA in development mode');
} else {
    // ... reCAPTCHA verification code
}
```

## Troubleshooting

### Common Issues:

1. **"ReCAPTCHA verification failed"**
   - Check that your Secret Key is correct in `.env.local`
   - Ensure your domain is registered with reCAPTCHA

2. **"reCAPTCHA verification required"**
   - Check that your Site Key is correct
   - Ensure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set properly

3. **Component not rendering**
   - Verify the npm package is installed: `npm list react-google-recaptcha`
   - Check browser console for JavaScript errors

4. **Environment variables not working**
   - Restart your development server after adding new env vars
   - Check that `.env.local` is in your project root
   - Verify no typos in environment variable names

### Testing in Production:

1. **Update reCAPTCHA domains** in Google reCAPTCHA admin panel
2. **Set production environment variables** in your hosting platform
3. **Test thoroughly** before going live

## Security Benefits

After implementing reCAPTCHA, your registration endpoint will be protected against:

- ✅ **Automated bot registrations**
- ✅ **Spam account creation**
- ✅ **Brute force registration attempts**
- ✅ **Script-based attacks**

## Additional Security Recommendations

1. **Enable email verification** for new accounts
2. **Monitor registration patterns** for suspicious activity
3. **Implement IP-based rate limiting** for production
4. **Consider reCAPTCHA v3** for even better bot detection
5. **Set up alerts** for high registration volumes

## reCAPTCHA Types Comparison

| Type | User Experience | Security Level | Implementation |
|------|-----------------|----------------|----------------|
| **v2 Checkbox** | User clicks "I'm not a robot" | Good | Easy ✅ |
| **v2 Invisible** | Runs automatically | Good | Medium |
| **v3** | No user interaction, scores behavior | Excellent | Complex |

For most applications, **v2 Checkbox** (implemented in this guide) provides the best balance of security and user experience.

---

## Complete File Structure

After implementation, your relevant files should look like this:

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── register/
│   │           └── route.js          # Updated with reCAPTCHA verification
│   └── auth/
│       └── signup/
│           └── page.js               # Updated with reCAPTCHA component
├── lib/
│   └── security/
│       └── registrationSecurity.js  # Security utilities (existing)
└── .env.local                       # Updated with reCAPTCHA keys
```

This implementation provides robust protection against bot registrations while maintaining a good user experience for legitimate users.