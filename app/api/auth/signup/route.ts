import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { mongoAdapter } from "@/lib/db/mongo-adapter"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await mongoAdapter.users.findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await mongoAdapter.users.createUser({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      message: "User created successfully",
      user: userWithoutPassword
    })

  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}