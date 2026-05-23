import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

const prisma = new PrismaClient();

// Validation schemas
const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  selectedAddOns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
  })).optional(),
  notes: z.string().optional(),
});

const updateQuantitySchema = z.object({
  cartItemId: z.string().min(1, 'Cart item ID is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
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
 * GET /api/cart
 * Get user's cart
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

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        isCheckedOut: false,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        promoCode: true,
      },
    });

    // If no cart exists, create one
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
          promoCode: true,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CART_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching cart',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Add item to cart
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
    const validation = cartItemSchema.safeParse(body);
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

    const { productId, variantId, quantity, selectedAddOns, notes } = validation.data;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
        isCheckedOut: false,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Calculate item price
    let unitPrice = product.basePrice.toNumber();
    let variantPrice = 0;

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant || variant.productId !== productId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid variant',
          },
          { status: 400 }
        );
      }

      variantPrice = variant.extraCost?.toNumber() || 0;
      unitPrice = variant.price.toNumber();
    }

    const addOnPrice = selectedAddOns?.reduce((sum, addon) => sum + addon.price * addon.quantity, 0) || 0;
    const totalPrice = (unitPrice + variantPrice + addOnPrice) * quantity;

    // Add item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        productVariantId: variantId,
        quantity,
        unitPrice: product.basePrice,
        totalPrice,
        selectedAddOns: selectedAddOns || null,
        notes: notes || null,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Item added to cart',
        data: cartItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CART_POST_ERROR]', error);

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
        message: 'An error occurred while adding item to cart',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart
 * Update cart item quantity
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

    const body: unknown = await request.json();

    // Validate request body
    const validation = updateQuantitySchema.safeParse(body);
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

    const { cartItemId, quantity } = validation.data;

    // Verify cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cart item not found',
        },
        { status: 404 }
      );
    }

    // Calculate new total price
    const newTotalPrice = cartItem.unitPrice.toNumber() * quantity;

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        totalPrice: newTotalPrice,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Cart item updated',
        data: updatedCartItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CART_PUT_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while updating cart',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Remove item from cart
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
    const cartItemId = searchParams.get('itemId');

    if (!cartItemId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cart item ID is required',
        },
        { status: 400 }
      );
    }

    // Verify cart item exists and belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cart item not found',
        },
        { status: 404 }
      );
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Item removed from cart',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CART_DELETE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while removing item from cart',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
