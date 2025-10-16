"use client"

export default function DeleteButton({ user, onDelete }) {
  const handleDelete = async () => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.name}"?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) return
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Call parent callback to refresh the data
        if (onDelete) {
          onDelete(user.id)
        }
        // Force page refresh as fallback
        window.location.reload()
      } else {
        alert(`Error: ${data.error || 'Failed to delete user'}`)
      }
    } catch (error) {
      console.error('Delete user error:', error)
      alert('Network error. Please try again.')
    }
  }
  
  return (
    <button 
      className="btn btn-sm btn-outline-danger"
      title={`Delete ${user.name}`}
      disabled={user.role === 'admin'}
      onClick={handleDelete}
    >
      <span>🗑️</span> Delete
    </button>
  )
}