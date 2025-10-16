import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

// Server side auth Helper function
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  console.log(`[Auth Helper] Checking admin access for user: ${session?.user?.email}, role: ${session?.user?.role}`);
  
  if (!session) {
    console.log(`[Auth Helper] No session found - redirecting to signin`);
    redirect("/auth/signin");
  }
  
  if (session.user?.role !== "admin") {
    console.log(`[Auth Helper] Non-admin user tried to access admin area - redirecting to access denied`);
    redirect("/access-denied");
  }
  
  console.log(`[Auth Helper] Admin access granted`);
  return session;
}

// Server side auth Helper function
export async function requireGuest() {
  const session = await getServerSession(authOptions);
  console.log(`[Auth Helper] Checking guest access for user: ${session?.user?.email}, role: ${session?.user?.role}`);
  
  if (!session) {
    console.log(`[Auth Helper] No session found - redirecting to signin`);
    redirect("/auth/signin");
  }
  
  if (session.user?.role !== "guest") {
    console.log(`[Auth Helper] Non-guest user tried to access guest area - redirecting to access denied`);
    redirect("/access-denied");
  }
  
  console.log(`[Auth Helper] Guest access granted`);
  return session;
}

// Server side auth Helper function
export async function requireSession() {
  const session = await getServerSession(authOptions);
  console.log(`[Auth Helper] Checking session for user: ${session?.user?.email}`);
  
  if (!session) {
    console.log(`[Auth Helper] No session found - redirecting to signin`);
    redirect("/auth/signin");
  }
  
  console.log(`[Auth Helper] Session found`);
  return session;
}