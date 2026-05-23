import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAllProducts,
  createProduct,
  type ProductQueryParams,
} from '@/lib/db';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

// Validation schemas
const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(12),
  categoryId: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  mainImage: z.string().url().optional(),
  gallery: z.any().optional(),
  basePrice: z.coerce.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  isVegan: z.coerce.boolean().optional(),
  isVegetarian: z.coerce.boolean().optional(),
  isSpicy: z.coerce.boolean().optional(),
  spiceLevel: z.coerce.number().int().min(0).max(5).optional(),
  calories: z.coerce.number().int().positive().optional(),
  variants: z.array(
    z.object({
      name: z.string(),
      price: z.coerce.number().positive(),
      stock: z.coerce.number().int().nonnegative().optional(),
    })
  ).optional(),
  addOns: z.array(
    z.object({
      name: z.string(),
      price: z.coerce.number().positive(),
      description: z.string().optional(),
      isRequired: z.coerce.boolean().optional(),
    })
  ).optional(),
});

/**
 * Check if user is admin (for now, basic check - integrate with proper auth)
 */
function isAdminRequest(token?: string): boolean {
  if (!token) return false;
  try {
    const decoded = verifyAccessToken(token);
    // TODO: Check user role from database
    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/products
 * Get all products with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate query parameters
    const queryData = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      categoryId: searchParams.get('categoryId'),
      isFeatured: searchParams.get('isFeatured'),
      search: searchParams.get('search'),
    };

    const validation = productQuerySchema.safeParse(queryData);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { page, limit, categoryId, isFeatured, search } = validation.data;

    const params: ProductQueryParams = {
      skip: (page - 1) * limit,
      take: limit,
      ...(categoryId && { categoryId }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(search && { search }),
      isPublished: true,
    };

    const result = await getAllProducts(params);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PRODUCTS_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching products',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product (admin only)
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
    const validation = createProductSchema.safeParse(body);
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

    const product = await createProduct(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[PRODUCTS_POST_ERROR]', error);

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
          message: 'Product slug must be unique',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while creating the product',
      },
      { status: 500 }
    );
  }
}
