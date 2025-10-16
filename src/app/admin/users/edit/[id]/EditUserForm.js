"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EditUserForm({ user }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "guest",
    status: user.status || "active",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || "User updated successfully!")
        
        // Redirect back to users list after a short delay
        setTimeout(() => {
          router.push('/admin/users')
          router.refresh() // Refresh the server component data
        }, 1500)
      } else {
        setError(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Update user error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/users')
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          <strong>Success:</strong> {success}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Full Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email Address <span className="text-danger">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <div className="form-text">
          Changing email may affect user&apos;s ability to sign in.
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="role" className="form-label">
          Role <span className="text-danger">*</span>
        </label>
        <select
          id="role"
          name="role"
          className="form-select"
          value={formData.role}
          onChange={handleChange}
          disabled={loading}
        >
         <option value="guest">Guest</option>
         <option value="member">Member</option>
         <option value="lead_host">Lead Host</option>
         <option value="admin">Admin</option>
        </select>
        <div className="form-text">
         Select the appropriate role for this user.
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="status" className="form-label">
          Account Status <span className="text-danger">*</span>
        </label>
        <select
          id="status"
          name="status"
          className="form-select"
          value={formData.status}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <div className="form-text">
          Inactive or suspended users cannot sign in.
        </div>
      </div>

      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          type="button"
          className="btn btn-secondary me-md-2"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Updating...
            </>
          ) : (
            'Update User'
          )}
        </button>
      </div>

      <div className="mt-3 text-center">
        <small className="text-muted">
          User ID: {user.id} • Created: {user.dateCreated ? new Date(user.dateCreated).toLocaleDateString() : 'N/A'}
        </small>
      </div>
    </form>
  )
}