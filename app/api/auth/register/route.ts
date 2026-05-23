import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  hashPassword,
  validateEmail,
  validatePassword,
  generateTokens,
} from '@/lib/auth';

const prisma = new PrismaClient();

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
});

type RegisterInput = z.infer<typeof registerSchema>;

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Validate request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data: RegisterInput = validation.data;

    // Additional email validation
    if (!validateEmail(data.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.message,
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Check if username is already taken (if provided)
    if (data.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUsername) {
        return NextResponse.json(
          {
            success: false,
            message: 'Username is already taken',
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        username: data.username || null,
        phone: data.phone || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          tokens,
        },
      },
      { status: 201 }
    );

    // Set refresh token in secure HTTP-only cookie
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during registration',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
