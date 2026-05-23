import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

const prisma = new PrismaClient();

// Validation schemas
const createOrderSchema = z.object({
  deliveryAddressId: z.string().min(1, 'Delivery address is required'),
  paymentMethod: z.enum(['CARD', 'WALLET', 'CASH_ON_DELIVERY', 'PAYPAL', 'APPLE_PAY', 'GOOGLE_PAY']),
  customerNote: z.string().optional(),
  orderType: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']).default('DELIVERY'),
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
 * Calculate delivery fee based on zone
 */
async function getDeliveryFee(deliveryAddressId: string): Promise<number> {
  const address = await prisma.deliveryAddress.findUnique({
    where: { id: deliveryAddressId },
    include: { zone: true },
  });

  if (!address || !address.zone) {
    return 0; // No delivery fee if zone not found
  }

  return address.zone.fee?.toNumber() || 0;
}

/**
 * Generate tracking number
 */
function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `FP-${timestamp}-${random}`;
}

/**
 * GET /api/orders
 * Get user's orders
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

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      userId,
      ...(status && { status: status as any }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          deliveryAddress: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ORDERS_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching orders',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create new order from cart
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
    const validation = createOrderSchema.safeParse(body);
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

    const { deliveryAddressId, paymentMethod, customerNote, orderType } = validation.data;

    // Verify delivery address belongs to user
    const address = await prisma.deliveryAddress.findUnique({
      where: { id: deliveryAddressId },
    });

    if (!address || address.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid delivery address',
        },
        { status: 400 }
      );
    }

    // Get user's active cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        isCheckedOut: false,
      },
      include: {
        items: true,
        promoCode: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cart is empty',
        },
        { status: 400 }
      );
    }

    // Calculate totals
    const subTotal = cart.items.reduce((sum, item) => sum + item.totalPrice.toNumber(), 0);
    const deliveryFee = await getDeliveryFee(deliveryAddressId);
    const discount = cart.discount?.toNumber() || 0;
    const tax = Math.round((subTotal * 7.5) / 100 * 100) / 100; // 7.5% VAT
    const total = subTotal + deliveryFee + tax - discount;

    // Create order with items
    const trackingNumber = generateTrackingNumber();

    const order = await prisma.order.create({
      data: {
        userId,
        deliveryAddressId,
        orderType,
        subTotal: new Prisma.Decimal(subTotal),
        deliveryFee: new Prisma.Decimal(deliveryFee),
        discount: new Prisma.Decimal(discount),
        tax: new Prisma.Decimal(tax),
        total: new Prisma.Decimal(total),
        paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PROCESSING',
        trackingNumber,
        customerNote,
        promoCodeId: cart.promoCodeId || undefined,
        items: {
          createMany: {
            data: cart.items.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              selectedAddOns: item.selectedAddOns,
              notes: item.notes,
              snapshotName: '', // Would be populated from product
              snapshotSlug: '', // Would be populated from product
            })),
          },
        },
      },
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

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        amount: new Prisma.Decimal(total),
        method: paymentMethod as any,
        status: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PROCESSING',
      },
    });

    // Mark cart as checked out and clear items
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        isCheckedOut: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: {
          order,
          trackingNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ORDERS_POST_ERROR]', error);

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
        message: 'An error occurred while creating the order',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
