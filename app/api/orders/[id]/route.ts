import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

const prisma = new PrismaClient();

// Validation schema
const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  restaurantNote: z.string().optional(),
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
 * GET /api/orders/[id]
 * Get order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        deliveryAddress: {
          include: {
            zone: true,
          },
        },
        payment: true,
        promoCode: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Verify user owns this order
    if (order.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Cannot access this order',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ORDER_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching order',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Update order status (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin (basic check)
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    try {
      verifyAccessToken(token);
      // TODO: Verify user is admin from database
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Admin access required',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    // Validate request body
    const validation = updateOrderStatusSchema.safeParse(body);
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

    const { status, restaurantNote } = validation.data;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Update order
    const updateData = {
      status,
      ...(restaurantNote && { restaurantNote }),
      ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
      ...(status === 'PREPARING' && { preparedAt: new Date() }),
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
    };

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveryAddress: true,
        payment: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ORDER_PUT_ERROR]', error);

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
        message: 'An error occurred while updating order',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/orders/[id]/tracking
 * Get order tracking info (public endpoint with tracking number)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        type: true,
        total: true,
        createdAt: true,
        confirmedAt: true,
        preparedAt: true,
        deliveredAt: true,
        deliveryAddress: {
          select: {
            street: true,
            city: true,
            state: true,
            landmark: true,
            zone: {
              select: {
                name: true,
                estimatedMins: true,
              },
            },
          },
        },
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ORDER_TRACKING_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching tracking info',
      },
      { status: 500 }
    );
  }
}
