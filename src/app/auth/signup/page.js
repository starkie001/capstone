"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
// import ReCAPTCHA from "react-google-recaptcha"  // Uncomment when ready to use reCAPTCHA

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // const [captchaValue, setCaptchaValue] = useState(null)  // Uncomment when ready to use reCAPTCHA
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

    // Uncomment when ready to use reCAPTCHA
    // if (!captchaValue) {
    //   setError("Please complete the reCAPTCHA")
    //   setLoading(false)
    //   return
    // }

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
          role: "guest" // Default role for new users
          // recaptchaToken: captchaValue  // Uncomment when ready to use reCAPTCHA
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful
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

            {/* Uncomment when ready to use reCAPTCHA */}
            {/* <div className="mb-3">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={setCaptchaValue}
                onExpired={() => setCaptchaValue(null)}
              />
            </div> */}

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