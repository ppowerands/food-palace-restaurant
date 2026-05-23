'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  topProduct: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    topProduct: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API calls
        setStats({
          totalOrders: 156,
          totalRevenue: 125000,
          pendingOrders: 8,
          topProduct: 'Suya Shawarma',
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: '📦',
      color: 'bg-blue-100',
    },
    {
      label: 'Revenue (₦)',
      value: stats.totalRevenue.toLocaleString(),
      icon: '💰',
      color: 'bg-green-100',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'bg-yellow-100',
    },
    {
      label: 'Top Product',
      value: stats.topProduct,
      icon: '🏆',
      color: 'bg-purple-100',
    },
  ];

  if (loading) {
    return <div className="text-center text-xl">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} rounded-lg p-6 shadow-sm border-l-4 border-[#00A8E8]`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-[#1A1A2E] mt-2">
                  {card.value}
                </p>
              </div>
              <span className="text-4xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-[#00A8E8]">
              <tr>
                <th className="text-left py-3 px-4 text-[#1A1A2E]">Order ID</th>
                <th className="text-left py-3 px-4 text-[#1A1A2E]">Customer</th>
                <th className="text-left py-3 px-4 text-[#1A1A2E]">Amount</th>
                <th className="text-left py-3 px-4 text-[#1A1A2E]">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((order) => (
                <tr key={order} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">ORD-{String(order).padStart(4, '0')}</td>
                  <td className="py-3 px-4">Customer {order}</td>
                  <td className="py-3 px-4">₦{(5000 * order).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button className="bg-[#00A8E8] text-white rounded-lg p-6 text-center hover:bg-[#0096C7] transition-colors font-bold">
          ➕ Add New Product
        </button>
        <button className="bg-[#FFD60A] text-[#1A1A2E] rounded-lg p-6 text-center hover:bg-yellow-400 transition-colors font-bold">
          📊 View Analytics
        </button>
      </div>
    </div>
  );
}
