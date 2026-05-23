'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Order {
  id: string;
  trackingNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    product: {
      name: string;
    };
  }>;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-800' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800' },
  PREPARING: { bg: 'bg-purple-50', text: 'text-purple-800' },
  OUT_FOR_DELIVERY: { bg: 'bg-indigo-50', text: 'text-indigo-800' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-800' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-800' },
  RETURNED: { bg: 'bg-gray-50', text: 'text-gray-800' },
};

const statusLabels: Record<string, string> = {
  PENDING: 'Order Received',
  CONFIRMED: 'Order Confirmed',
  PREPARING: 'Being Prepared',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [token, router, page, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await axios.get(`/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilterStatus('');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === ''
                  ? 'bg-[#00A8E8] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            {['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                  filterStatus === status
                    ? 'bg-[#00A8E8] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8E8]"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No orders found</p>
            <Link href="/menu" className="text-[#00A8E8] hover:text-[#0096C7] font-medium transition">
              Start ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const colors = statusColors[order.status] || statusColors.PENDING;
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Order Info */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Order ID</p>
                        <p className="font-mono text-sm text-gray-900 truncate">{order.id}</p>
                        <p className="text-sm text-gray-600 mt-2 mb-1">Tracking</p>
                        <p className="font-mono text-sm text-[#00A8E8]">{order.trackingNumber}</p>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Items</p>
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-900">
                              {item.quantity}x {item.product.name}
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-600">+{order.items.length - 2} more</p>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>

                      {/* Total & Date */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-lg font-bold text-gray-900 mb-3">₦{order.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-NG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700 font-medium">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
