import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from '@/lib/db';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

// Validation schemas
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().optional(),
  mainImage: z.string().url().optional(),
  basePrice: z.coerce.number().positive().optional(),
  isPublished: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isVegan: z.coerce.boolean().optional(),
  isVegetarian: z.coerce.boolean().optional(),
  isSpicy: z.coerce.boolean().optional(),
  spiceLevel: z.coerce.number().int().min(0).max(5).optional(),
  calories: z.coerce.number().int().positive().optional(),
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
 * GET /api/products/[id]
 * Get a single product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PRODUCT_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching the product',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * Update a product (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    // Validate request body
    const validation = updateProductSchema.safeParse(body);
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

    // Check if product exists
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    const updatedProduct = await updateProduct(id, validation.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PRODUCT_PUT_ERROR]', error);

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
        message: 'An error occurred while updating the product',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    await deleteProduct(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PRODUCT_DELETE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while deleting the product',
      },
      { status: 500 }
    );
  }
}
