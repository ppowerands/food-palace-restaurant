import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

const prisma = new PrismaClient();

// Validation schemas
const createZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  slug: z.string().min(1, 'Zone slug is required'),
  description: z.string().optional(),
  minimumOrder: z.coerce.number().nonnegative().optional().default(0),
  fee: z.coerce.number().nonnegative('Fee must be non-negative'),
  estimatedMins: z.coerce.number().int().positive().optional(),
  coverageArea: z.any().optional(),
});

/**
 * Check if user is admin
 */
function isAdminRequest(token?: string): boolean {
  if (!token) return false;
  try {
    verifyAccessToken(token);
    // TODO: Check user role from database
    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/zones
 * Get all delivery zones
 */
export async function GET(request: NextRequest) {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: zones,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ZONES_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching zones',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/zones
 * Create a new delivery zone (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token || !isAdminRequest(token)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Admin access required',
        },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    // Validate request body
    const validation = createZoneSchema.safeParse(body);
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

    const zone = await prisma.deliveryZone.create({
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        description: validation.data.description,
        minimumOrder: new Prisma.Decimal(validation.data.minimumOrder),
        fee: new Prisma.Decimal(validation.data.fee),
        estimatedMins: validation.data.estimatedMins,
        coverageArea: validation.data.coverageArea,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Delivery zone created successfully',
        data: zone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ZONES_POST_ERROR]', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Zone slug must be unique',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while creating the zone',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PUT /api/zones?id=[id]
 * Update a delivery zone (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token || !isAdminRequest(token)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Admin access required',
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
          message: 'Zone ID is required',
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    // Partial validation for updates
    const updateSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      minimumOrder: z.coerce.number().nonnegative().optional(),
      fee: z.coerce.number().nonnegative().optional(),
      estimatedMins: z.coerce.number().int().positive().optional(),
      isActive: z.coerce.boolean().optional(),
    });

    const validation = updateSchema.safeParse(body);
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

    const data: Prisma.DeliveryZoneUpdateInput = {};
    if (validation.data.name) data.name = validation.data.name;
    if (validation.data.description) data.description = validation.data.description;
    if (validation.data.minimumOrder !== undefined) data.minimumOrder = new Prisma.Decimal(validation.data.minimumOrder);
    if (validation.data.fee !== undefined) data.fee = new Prisma.Decimal(validation.data.fee);
    if (validation.data.estimatedMins) data.estimatedMins = validation.data.estimatedMins;
    if (validation.data.isActive !== undefined) data.isActive = validation.data.isActive;

    const zone = await prisma.deliveryZone.update({
      where: { id },
      data,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Zone updated successfully',
        data: zone,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ZONES_PUT_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while updating the zone',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/zones?id=[id]
 * Soft delete a delivery zone (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token || !isAdminRequest(token)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Admin access required',
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
          message: 'Zone ID is required',
        },
        { status: 400 }
      );
    }

    // Soft delete by marking as inactive
    await prisma.deliveryZone.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Zone deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ZONES_DELETE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while deleting the zone',
      },
      { status: 500 }
    );
  }
}
