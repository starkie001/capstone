import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"

export default async function HandleRedirectAfterLogin() {
  console.log('[Redirect Handler] Getting session for post-login redirect')
  
  // Get the current session
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    console.log('[Redirect Handler] No session found, redirecting to signin')
    redirect('/auth/signin')
  }
  
  const { role } = session.user
  console.log(`[Redirect Handler] User role: ${role}, redirecting accordingly`)
  
  // Always redirect to bookings page after login
  console.log('[Redirect Handler] Redirecting user to /bookings')
  redirect('/bookings')
}