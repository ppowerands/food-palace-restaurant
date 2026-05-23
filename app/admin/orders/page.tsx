'use client';

import { useState } from 'react';

interface Order {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';
  items: number;
  date: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderId: 'ORD-0001',
      customer: 'Chioma Okafor',
      phone: '+234 801 234 5678',
      amount: 15500,
      status: 'pending',
      items: 3,
      date: '2024-05-23 14:30',
    },
    {
      id: '2',
      orderId: 'ORD-0002',
      customer: 'Emeka Nwosu',
      phone: '+234 803 456 7890',
      amount: 8750,
      status: 'preparing',
      items: 2,
      date: '2024-05-23 13:45',
    },
    {
      id: '3',
      orderId: 'ORD-0003',
      customer: 'Ade Johnson',
      phone: '+234 805 678 9012',
      amount: 12200,
      status: 'ready',
      items: 4,
      date: '2024-05-23 12:20',
    },
    {
      id: '4',
      orderId: 'ORD-0004',
      customer: 'Zainab Ali',
      phone: '+234 807 890 1234',
      amount: 6500,
      status: 'out_for_delivery',
      items: 1,
      date: '2024-05-23 11:00',
    },
    {
      id: '5',
      orderId: 'ORD-0005',
      customer: 'Kunle Taiwo',
      phone: '+234 809 012 3456',
      amount: 19800,
      status: 'delivered',
      items: 5,
      date: '2024-05-23 09:30',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const statusColors = {
    pending: { bg: 'bg-red-100', text: 'text-red-800', label: '⏳ Pending' },
    preparing: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: '👨‍🍳 Preparing',
    },
    ready: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✅ Ready' },
    out_for_delivery: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: '🚗 Out for Delivery',
    },
    delivered: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: '🎉 Delivered',
    },
  };

  const updateOrderStatus = (
    id: string,
    newStatus: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'
  ) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const getNextStatus = (
    currentStatus: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'
  ) => {
    const statusFlow = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'out_for_delivery',
      out_for_delivery: 'delivered',
      delivered: 'delivered',
    };
    return statusFlow[currentStatus] as any;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#1A1A2E]">Orders</h2>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#00A8E8] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {Object.entries(statusColors).map(([status, { label }]) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-[#00A8E8] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-[#00A8E8]">
            <tr>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Order ID
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Items
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Status
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Time
              </th>
              <th className="px-6 py-4 text-left text-[#1A1A2E] font-bold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const colors = statusColors[order.status];
              const nextStatus = getNextStatus(order.status);
              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-[#00A8E8]">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#1A1A2E]">
                      {order.customer}
                    </div>
                    <div className="text-sm text-gray-500">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#1A1A2E]">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#00A8E8]">
                    ₦{order.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}
                    >
                      {colors.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.date}
                  </td>
                  <td className="px-6 py-4">
                    {order.status !== 'delivered' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, nextStatus)
                        }
                        className="bg-[#FFD60A] text-[#1A1A2E] px-3 py-1 rounded font-bold hover:bg-yellow-400 text-sm"
                      >
                        Next Step
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      )}
    </div>
  );
}
