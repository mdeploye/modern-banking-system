import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            customer: true,
            admin: true,
          },
        })

        if (!user) {
          throw new Error("User not found")
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        // Check if the role matches
        if (credentials.role && user.role !== credentials.role) {
          throw new Error("Invalid user type")
        }

        // Check if customer account is restricted
        if (user.role === "CUSTOMER" && user.customer?.isRestricted) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            customerId: user.customer?.id,
            adminId: user.admin?.id,
            isRestricted: true,
            restrictionType: user.customer?.restrictionType || undefined,
            restrictionReason: user.customer?.restrictionReason || undefined,
          }
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          customerId: user.customer?.id,
          adminId: user.admin?.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || ""
        token.role = user.role || "CUSTOMER"
        token.customerId = user.customerId || undefined
        token.adminId = user.adminId || undefined
        token.isRestricted = user.isRestricted || false
        token.restrictionType = user.restrictionType || undefined
        token.restrictionReason = user.restrictionReason || undefined
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.customerId = token.customerId as string | undefined
        session.user.adminId = token.adminId as string | undefined
        session.user.isRestricted = token.isRestricted as boolean | undefined
        session.user.restrictionType = token.restrictionType as string | undefined
        session.user.restrictionReason = token.restrictionReason as string | undefined
      }
      return session
    },
  },
})

declare module "next-auth" {
  interface User {
    role: Role
    customerId?: string
    adminId?: string
    isRestricted?: boolean
    restrictionType?: string
    restrictionReason?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      role: Role
      customerId?: string
      adminId?: string
      isRestricted?: boolean
      restrictionType?: string
      restrictionReason?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    customerId?: string
    adminId?: string
    isRestricted?: boolean
    restrictionType?: string
    restrictionReason?: string
  }
}
