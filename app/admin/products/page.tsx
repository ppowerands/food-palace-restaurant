'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setProducts([
      {
        id: '1',
        name: 'Suya Shawarma',
        price: 3500,
        category: 'Shawarma',
        stock: 45,
      },
      {
        id: '2',
        name: 'Beef Burger',
        price: 2500,
        category: 'Burgers',
        stock: 32,
      },
      {
        id: '3',
        name: 'Jollof Rice',
        price: 2000,
        category: 'Rice',
        stock: 28,
      },
    ]);
    setLoading(false);
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A2E]">Products</h2>
        <Link
          href="/admin/products/new"
          className="bg-[#00A8E8] text-white px-6 py-2 rounded-lg hover:bg-[#0096C7] font-bold"
        >
          ➕ Add Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-[#00A8E8]">
            <tr>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Product Name
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Category
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Price
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-[#1A1A2E]">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                <td className="px-6 py-4 font-bold text-[#00A8E8]">
                  ₦{product.price.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock > 20
                        ? 'bg-green-100 text-green-800'
                        : product.stock > 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.stock} left
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="bg-[#0096C7] text-white px-3 py-1 rounded hover:bg-[#00A8E8] text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}