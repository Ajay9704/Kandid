// NextAuth configuration - server side only
import NextAuth, { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"

// Add this to ensure the module only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('This module should only be imported on the server side')
}

// Only import the mongo adapter on the server side
let mongoAdapter: any;
try {
  mongoAdapter = require("@/lib/db/mongo-adapter").mongoAdapter
} catch (error) {
  console.warn("MongoDB adapter not available in this environment:", error)
  mongoAdapter = null
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        if (!mongoAdapter) {
          console.error("MongoDB adapter is not available")
          return null
        }

        try {
          // Find user in database
          const user = await mongoAdapter.users.findUserByEmail(credentials.email)
          
          if (!user || !user.password) {
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error("Auth error:", error)
          // Check if this is a database connection error
          if (error instanceof Error && error.message.includes('Database not initialized')) {
            console.error('Database connection error during authentication. This may be due to missing DATABASE_URL environment variable in Vercel.')
          }
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    })
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export default NextAuth(authOptions)