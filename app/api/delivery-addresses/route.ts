import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

const prisma = new PrismaClient();

// Validation schemas
const createAddressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  landmark: z.string().optional(),
  instructions: z.string().optional(),
  zoneId: z.string().optional(),
  isDefault: z.coerce.boolean().optional(),
});

const updateAddressSchema = z.object({
  label: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  landmark: z.string().optional(),
  instructions: z.string().optional(),
  zoneId: z.string().optional(),
  isDefault: z.coerce.boolean().optional(),
});

/**
 * Extract user ID from token
 */
async function getUserIdFromToken(authHeader?: string): Promise<string | null> {
  if (!authHeader) return null;
  
  const token = extractTokenFromHeader(authHeader);
  if (!token) return null;

  try {
    const decoded = verifyAccessToken(token);
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * GET /api/delivery-addresses
 * Get user's delivery addresses
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request.headers.get('Authorization') || '');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Please login',
        },
        { status: 401 }
      );
    }

    const addresses = await prisma.deliveryAddress.findMany({
      where: { userId },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            fee: true,
            estimatedMins: true,
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(
      {
        success: true,
        data: addresses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADDRESSES_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching addresses',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/delivery-addresses
 * Create a new delivery address
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request.headers.get('Authorization') || '');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Please login',
        },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    // Validate request body
    const validation = createAddressSchema.safeParse(body);
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

    // If this is default, unset other defaults
    if (validation.data.isDefault) {
      await prisma.deliveryAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.deliveryAddress.create({
      data: {
        userId,
        ...validation.data,
        country: 'Nigeria',
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            fee: true,
            estimatedMins: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Address added successfully',
        data: address,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ADDRESSES_POST_ERROR]', error);

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
        message: 'An error occurred while creating address',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/delivery-addresses?id=[id]
 * Update a delivery address
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request.headers.get('Authorization') || '');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Please login',
        },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Address ID is required',
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    // Validate request body
    const validation = updateAddressSchema.safeParse(body);
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

    // Verify address belongs to user
    const existingAddress = await prisma.deliveryAddress.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Address not found',
        },
        { status: 404 }
      );
    }

    // If setting as default, unset others
    if (validation.data.isDefault) {
      await prisma.deliveryAddress.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.deliveryAddress.update({
      where: { id },
      data: validation.data,
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            fee: true,
            estimatedMins: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Address updated successfully',
        data: address,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADDRESSES_PUT_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while updating address',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/delivery-addresses?id=[id]
 * Delete a delivery address
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request.headers.get('Authorization') || '');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Please login',
        },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Address ID is required',
        },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const address = await prisma.deliveryAddress.findUnique({
      where: { id },
    });

    if (!address || address.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Address not found',
        },
        { status: 404 }
      );
    }

    await prisma.deliveryAddress.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Address deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADDRESSES_DELETE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while deleting address',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
