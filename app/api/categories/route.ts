import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAllCategories,
  createCategory,
  updateCategory,
} from '@/lib/db';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required'),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional().default(0),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  isActive: z.coerce.boolean().optional(),
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
 * GET /api/categories
 * Get all categories
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await getAllCategories();

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CATEGORIES_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching categories',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Create a new category (admin only)
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
    const validation = createCategorySchema.safeParse(body);
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

    const category = await createCategory(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CATEGORIES_POST_ERROR]', error);

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
          message: 'Category slug must be unique',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while creating the category',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categories/[id]
 * Update a category (admin only) - handled via dynamic route if needed
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
          message: 'Category ID is required',
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    const validation = updateCategorySchema.safeParse(body);
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

    const category = await updateCategory(id, validation.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Category updated successfully',
        data: category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CATEGORIES_PUT_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while updating the category',
      },
      { status: 500 }
    );
  }
}
