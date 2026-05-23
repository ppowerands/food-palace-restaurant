import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAllAddOns,
  createProductAddOn,
  updateProductAddOn,
  deleteProductAddOn,
} from '@/lib/db';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth';

// Validation schemas
const createAddOnSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Add-on name is required'),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative('Price must be non-negative'),
  isRequired: z.coerce.boolean().optional().default(false),
  maxQuantity: z.coerce.number().int().positive().optional().default(1),
});

const updateAddOnSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative().optional(),
  isRequired: z.coerce.boolean().optional(),
  maxQuantity: z.coerce.number().int().positive().optional(),
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
 * GET /api/addons
 * Get all add-ons
 */
export async function GET(request: NextRequest) {
  try {
    const addOns = await getAllAddOns();

    return NextResponse.json(
      {
        success: true,
        data: addOns,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADDONS_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching add-ons',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addons
 * Create a new add-on (admin only)
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
    const validation = createAddOnSchema.safeParse(body);
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

    const addOn = await createProductAddOn(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Add-on created successfully',
        data: addOn,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ADDONS_POST_ERROR]', error);

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
        message: 'An error occurred while creating the add-on',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/addons?id=[id]
 * Update an add-on (admin only)
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
          message: 'Add-on ID is required',
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    const validation = updateAddOnSchema.safeParse(body);
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

    const addOn = await updateProductAddOn(id, validation.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Add-on updated successfully',
        data: addOn,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADDONS_PUT_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while updating the add-on',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/addons?id=[id]
 * Delete an add-on (admin only)
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
          message: 'Add-on ID is required',
        },
        { status: 400 }
      );
    }

    await deleteProductAddOn(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Add-on deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADDONS_DELETE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while deleting the add-on',
      },
      { status: 500 }
    );
  }
}
