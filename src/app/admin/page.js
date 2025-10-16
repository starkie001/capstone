import { getServerSession } from "next-auth"
import { authOptions } from "../../auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    redirect("/auth/signin")
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Admin Dashboard</h1>
      <p>Welcome, {session.user?.name}</p>
      <Link href="/admin/users" className="btn btn-primary mt-3">
        Manage Users
      </Link>
    </div>
  )
}