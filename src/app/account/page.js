import { getServerSession } from "next-auth"
import { authOptions } from "../../auth"
import { redirect } from "next/navigation"

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/auth/signin")

  return (
    <div className="container mt-5">
      <h1 className="mb-4">My Account</h1>
      <p>Hello, {session.user?.name}</p>
      <p>Your role: {session.user?.role}</p>
    </div>
  )
}