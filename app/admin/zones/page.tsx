'use client';

import { useState } from 'react';

interface Zone {
  id: string;
  name: string;
  area: string;
  deliveryFee: number;
  deliveryTime: string;
  isActive: boolean;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([
    {
      id: '1',
      name: 'Lekki Phase 1',
      area: 'Lekki, Lagos',
      deliveryFee: 2000,
      deliveryTime: '30-45 mins',
      isActive: true,
    },
    {
      id: '2',
      name: 'Victoria Island',
      area: 'VI, Lagos',
      deliveryFee: 2500,
      deliveryTime: '40-60 mins',
      isActive: true,
    },
    {
      id: '3',
      name: 'Ikeja GRA',
      area: 'Ikeja, Lagos',
      deliveryFee: 1800,
      deliveryTime: '25-40 mins',
      isActive: true,
    },
    {
      id: '4',
      name: 'Yaba',
      area: 'Yaba, Lagos',
      deliveryFee: 1500,
      deliveryTime: '20-30 mins',
      isActive: false,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    area: '',
    deliveryFee: 0,
    deliveryTime: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'deliveryFee'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleAddZone = () => {
    if (formData.name && formData.area) {
      if (editingId) {
        setZones(
          zones.map((zone) =>
            zone.id === editingId
              ? {
                  ...zone,
                  name: formData.name,
                  area: formData.area,
                  deliveryFee: formData.deliveryFee,
                  deliveryTime: formData.deliveryTime,
                }
              : zone
          )
        );

        setEditingId(null);
      } else {
        setZones([
          ...zones,
          {
            id: Date.now().toString(),
            name: formData.name,
            area: formData.area,
            deliveryFee: formData.deliveryFee,
            deliveryTime: formData.deliveryTime,
            isActive: true,
          },
        ]);
      }

      setFormData({
        name: '',
        area: '',
        deliveryFee: 0,
        deliveryTime: '',
      });

      setShowForm(false);
    }
  };

  const handleEditZone = (zone: Zone) => {
    setFormData({
      name: zone.name,
      area: zone.area,
      deliveryFee: zone.deliveryFee,
      deliveryTime: zone.deliveryTime,
    });

    setEditingId(zone.id);
    setShowForm(true);
  };

  const handleDeleteZone = (id: string) => {
    if (confirm('Delete this delivery zone?')) {
      setZones(
        zones.filter((zone) => zone.id !== id)
      );
    }
  };

  const toggleZoneStatus = (id: string) => {
    setZones(
      zones.map((zone) =>
        zone.id === id
          ? {
              ...zone,
              isActive: !zone.isActive,
            }
          : zone
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#1A1A2E]">
          Delivery Zones
        </h2>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);

            setFormData({
              name: '',
              area: '',
              deliveryFee: 0,
              deliveryTime: '',
            });
          }}
          className="bg-[#00A8E8] text-white px-6 py-2 rounded-lg hover:bg-[#0096C7] font-bold"
        >
          ➕ Add Zone
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-xl font-bold text-[#1A1A2E]">
            {editingId
              ? 'Edit Zone'
              : 'New Delivery Zone'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Lekki Phase 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area/Location
            </label>

            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="e.g., Lekki, Lagos"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Fee (₦)
              </label>

              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time
              </label>

              <input
                type="text"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                placeholder="e.g., 30-45 mins"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddZone}
              className="flex-1 bg-[#00A8E8] text-white px-4 py-2 rounded-lg hover:bg-[#0096C7] font-bold"
            >
              {editingId
                ? '💾 Update'
                : '➕ Add Zone'}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-bold"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`rounded-lg shadow-sm p-6 border-l-4 ${
              zone.isActive
                ? 'bg-green-50 border-green-500'
                : 'bg-gray-50 border-gray-400'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-[#1A1A2E]">
                  {zone.name}
                </h4>

                <p className="text-sm text-gray-600">
                  {zone.area}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  zone.isActive
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {zone.isActive
                  ? '🟢 Active'
                  : '🔴 Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Delivery Fee:
                </span>

                <span className="font-bold text-[#00A8E8]">
                  ₦
                  {zone.deliveryFee.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Estimated Time:
                </span>

                <span className="font-bold text-[#1A1A2E]">
                  {zone.deliveryTime}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  toggleZoneStatus(zone.id)
                }
                className={`flex-1 px-3 py-2 rounded font-bold text-sm transition-colors ${
                  zone.isActive
                    ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                    : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                }`}
              >
                {zone.isActive
                  ? '⏸ Disable'
<<<<<<< HEAD
                  : '▶️ Enable'}
=======
                  : '▶ Enable'}
>>>>>>> 45c7469800ddcec979e08072fc0a9ee6d946dd78
              </button>

              <button
                onClick={() =>
                  handleEditZone(zone)
                }
                className="flex-1 bg-[#0096C7] text-white px-3 py-2 rounded hover:bg-[#00A8E8] font-bold text-sm"
              >
                ✏️ Edit
              </button>

              <button
                onClick={() =>
                  handleDeleteZone(zone.id)
                }
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 font-bold text-sm"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}