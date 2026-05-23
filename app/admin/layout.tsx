'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Products', href: '/admin/products', icon: '🍔' },
    { label: 'Orders', href: '/admin/orders', icon: '📦' },
    { label: 'Zones', href: '/admin/zones', icon: '🗺️' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1A1A2E] text-white transition-all duration-300`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#00A8E8]">FP</h1>
          <p className="text-xs text-gray-400">Food Palace</p>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-lg px-4 py-3 text-gray-300 hover:bg-[#00A8E8] hover:text-white transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute bottom-6 left-4 rounded-lg bg-[#00A8E8] p-2 text-white hover:bg-[#0096C7]"
        >
          {isSidebarOpen ? '←' : '→'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white px-8 py-4 shadow-sm border-b-2 border-[#00A8E8]">
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Admin Dashboard</h2>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}