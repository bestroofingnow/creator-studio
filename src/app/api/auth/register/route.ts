import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with free tier credits
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
        credits: 1000, // Free tier starting credits
        subscriptionTier: "free",
        subscriptionStatus: "active",
      },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        subscriptionTier: true,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
