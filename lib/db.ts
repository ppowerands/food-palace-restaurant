import {
  PrismaClient,
  Prisma,
} from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export interface ProductQueryParams {
  skip?: number;
  take?: number;
  categoryId?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  search?: string;
}

/**
 * Get all products with pagination and filtering
 */
export async function getAllProducts(
  params: ProductQueryParams = {}
) {
  const {
    skip = 0,
    take = 12,
    categoryId,
    isFeatured,
    isPublished = true,
    search,
  } = params;

  const where: any = {
    isPublished,

    ...(categoryId && {
      categoryId,
    }),

    ...(isFeatured !== undefined && {
      isFeatured,
    }),

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          shortDescription: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    }),
  };

  const [products, total] =
    await Promise.all([
      prisma.product.findMany({
        where,

        include: {
          category: true,

          variants: {
            where: {
              isActive: true,
            },
          },

          addOns: true,

          reviews: {
            select: {
              rating: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },

        skip,
        take,
      }),

      prisma.product.count({
        where,
      }),
    ]);

  const productsWithRating =
    products.map((product: any) => ({
      ...product,

      averageRating:
        product.reviews.length > 0
          ? (
              product.reviews.reduce(
                (
                  sum: number,
                  r: any
                ) => sum + r.rating,
                0
              ) /
              product.reviews.length
            ).toFixed(1)
          : 0,

      reviewCount:
        product.reviews.length,
    }));

  return {
    data: productsWithRating,

    pagination: {
      total,
      skip,
      take,

      pages: Math.ceil(
        total / take
      ),
    },
  };
}

/**
 * Get a single product by ID
 */
export async function getProductById(
  id: string
) {
  const product =
    await prisma.product.findUnique({
      where: { id },

      include: {
        category: true,

        variants: {
          where: {
            isActive: true,
          },
        },

        addOns: true,

        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },

          take: 10,
        },
      },
    });

  if (!product) {
    return null;
  }

  const averageRating =
    product.reviews.length > 0
      ? (
          product.reviews.reduce(
            (
              sum: number,
              r: any
            ) => sum + r.rating,
            0
          ) / product.reviews.length
        ).toFixed(1)
      : 0;

  return {
    ...product,

    averageRating,

    reviewCount:
      product.reviews.length,
  };
}

/**
 * Create a new product
 */
export async function createProduct(
  data: {
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;
    mainImage?: string;
    gallery?: unknown;
    basePrice: number;
    categoryId: string;
    isVegan?: boolean;
    isVegetarian?: boolean;
    isSpicy?: boolean;
    spiceLevel?: number;
    calories?: number;

    variants?: Array<{
      name: string;
      price: number;
      stock?: number;
    }>;

    addOns?: Array<{
      name: string;
      price: number;
      description?: string;
      isRequired?: boolean;
    }>;
  }
) {
  const {
    variants,
    addOns,
    ...productData
  } = data;

  const product =
    await prisma.product.create({
      data: {
        ...productData,

        // FIXED JSON FIELD
        gallery:
          productData.gallery as Prisma.InputJsonValue,

        basePrice:
          productData.basePrice,

        variants: variants
          ? {
              createMany: {
                data: variants.map(
                  (v) => ({
                    name: v.name,

                    price: v.price,

                    stock:
                      v.stock || 0,
                  })
                ),
              },
            }
          : undefined,

        addOns: addOns
          ? {
              createMany: {
                data: addOns.map(
                  (a) => ({
                    name: a.name,

                    price: a.price,

                    description:
                      a.description,

                    isRequired:
                      a.isRequired ||
                      false,
                  })
                ),
              },
            }
          : undefined,
      },

      include: {
        category: true,
        variants: true,
        addOns: true,
      },
    });

  return product;
}

/**
 * Update a product
 */
export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    shortDescription: string;
    mainImage: string;
    basePrice: number;
    isPublished: boolean;
    isFeatured: boolean;
    isVegan: boolean;
    isVegetarian: boolean;
    isSpicy: boolean;
    spiceLevel: number;
    calories: number;
  }>
) {
  const updateData: any = {
    ...data,

    ...(data.basePrice !==
      undefined && {
      basePrice: data.basePrice,
    }),
  };

  const product =
    await prisma.product.update({
      where: { id },

      data: updateData,

      include: {
        category: true,
        variants: true,
        addOns: true,
      },
    });

  return product;
}

/**
 * Delete a product
 */
export async function deleteProduct(
  id: string
) {
  await prisma.product.delete({
    where: { id },
  });
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(
  limit: number = 6
) {
  const products =
    await prisma.product.findMany({
      where: {
        isFeatured: true,
        isPublished: true,
      },

      include: {
        category: true,

        variants: {
          where: {
            isActive: true,
          },
        },

        addOns: true,

        reviews: {
          select: {
            rating: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit,
    });

  return products.map(
    (product: any) => ({
      ...product,

      averageRating:
        product.reviews.length > 0
          ? (
              product.reviews.reduce(
                (
                  sum: number,
                  r: any
                ) => sum + r.rating,
                0
              ) /
              product.reviews.length
            ).toFixed(1)
          : 0,

      reviewCount:
        product.reviews.length,
    })
  );
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export async function getAllCategories() {
  const categories =
    await prisma.category.findMany({
      where: {
        isActive: true,
      },

      include: {
        products: {
          where: {
            isPublished: true,
          },

          select: {
            id: true,
          },
        },
      },

      orderBy: {
        sortOrder: 'asc',
      },
    });

  return categories.map(
    (cat: any) => ({
      ...cat,

      productCount:
        cat.products.length,

      products: undefined,
    })
  );
}

export async function getCategoryById(
  id: string
) {
  const category =
    await prisma.category.findUnique({
      where: { id },

      include: {
        products: {
          where: {
            isPublished: true,
          },

          include: {
            variants: {
              where: {
                isActive: true,
              },
            },

            addOns: true,

            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

  if (!category) {
    return null;
  }

  return {
    ...category,

    products:
      category.products.map(
        (p: any) => ({
          ...p,

          averageRating:
            p.reviews.length > 0
              ? (
                  p.reviews.reduce(
                    (
                      sum: number,
                      r: any
                    ) =>
                      sum +
                      r.rating,
                    0
                  ) /
                  p.reviews.length
                ).toFixed(1)
              : 0,
        })
      ),
  };
}

export async function createCategory(
  data: {
    name: string;
    slug: string;
    description?: string;
    sortOrder?: number;
  }
) {
  return prisma.category.create({
    data,
  });
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>
) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

// ============================================================================
// ADD-ON QUERIES
// ============================================================================

export async function getAllAddOns() {
  return prisma.productAddOn.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getProductAddOns(
  productId: string
) {
  return prisma.productAddOn.findMany({
    where: { productId },

    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createProductAddOn(
  data: {
    productId: string;
    name: string;
    description?: string;
    price: number;
    isRequired?: boolean;
    maxQuantity?: number;
  }
) {
  return prisma.productAddOn.create({
    data: {
      productId:
        data.productId,

      name: data.name,

      description:
        data.description,

      price: data.price,

      isRequired:
        data.isRequired || false,

      maxQuantity:
        data.maxQuantity || 1,
    },
  });
}

export async function updateProductAddOn(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    isRequired: boolean;
    maxQuantity: number;
  }>
) {
  const updateData: any = {
    ...data,

    ...(data.price !==
      undefined && {
      price: data.price,
    }),
  };

  return prisma.productAddOn.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteProductAddOn(
  id: string
) {
  await prisma.productAddOn.delete({
    where: { id },
  });
}

// ============================================================================
// VARIANT QUERIES
// ============================================================================

export async function updateVariantStock(
  id: string,
  stock: number
) {
  return prisma.productVariant.update({
    where: { id },
    data: { stock },
  });
}

export async function getProductVariants(
  productId: string
) {
  return prisma.productVariant.findMany({
    where: {
      productId,
      isActive: true,
    },

    orderBy: {
      createdAt: 'asc',
    },
  });
}