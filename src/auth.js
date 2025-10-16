// auth.js
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { UserController } from "@/lib/controllers/UserController"

const userController = new UserController();

export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log(`[NextAuth] Credentials authorize attempt for: ${credentials?.email}`);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('[NextAuth] Missing email or password');
            return null;
          }

          // Use UserController to authenticate
          const user = await userController.authenticateUser(credentials.email, credentials.password);
          
          if (user) {
            console.log(`[NextAuth] Authentication successful for: ${credentials.email}`);
            // Return user object that will be stored in JWT
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
              status: user.status
            };
          }
          
          console.log(`[NextAuth] Authentication failed for: ${credentials.email}`);
          return null;
        } catch (error) {
          console.error('[NextAuth] Authentication error:', error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        try {
          console.log(`[NextAuth] Google login attempt for: ${profile.email}`);
          
          // Check if user already exists in our database
          let user = await userController.getUserByEmail(profile.email);
          
          if (!user) {
            // User doesn't exist, create them with Google profile data
            console.log(`[NextAuth] Creating new user from Google profile: ${profile.email}`);
            
            const newUserData = {
              name: profile.name,
              email: profile.email,
              image: profile.picture,
              role: "guest", // Default role for Google users
              status: "active",
              // No password needed for OAuth users
            };
            
            user = await userController.createUser(newUserData);
            console.log(`[NextAuth] Google user created successfully with ID: ${user.id}`);
          } else {
            console.log(`[NextAuth] Existing Google user found: ${profile.email}`);
            
            // Optionally update user's image if it has changed
            if (user.image !== profile.picture) {
              console.log(`[NextAuth] Updating profile image for user: ${profile.email}`);
              user = await userController.updateUser(user.id, { 
                image: profile.picture 
              });
            }
          }
          
          // Return user object for NextAuth
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            status: user.status
          };
          
        } catch (error) {
          console.error('[NextAuth] Google profile processing error:', error);
          // Return null to deny access if there's an error
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        // Store user data in JWT token
        token.role = user.role || "guest";
        token.picture = user.image || profile?.picture || null;
        token.status = user.status || "active";
        token.id = user.id;
        console.log(`[NextAuth] JWT token created for user ID: ${user.id}, role: ${token.role}`);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // Add custom fields to session
        session.user.role = token.role;
        session.user.image = token.picture || null;
        session.user.status = token.status;
        session.user.id = token.id;
        console.log(`[NextAuth] Session created for user: ${session.user.email}, role: ${session.user.role}`);
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
}
