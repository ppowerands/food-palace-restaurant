'use client';

import { useState } from 'react';

interface Settings {
  restaurantName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  description: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  mondayOpen: string;
  mondayClose: string;
  sundayOpen: string;
  sundayClose: string;
  isOpen: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    restaurantName: 'Food Palace',
    email: 'hello@foodpalace.ng',
    phone: '+234 701 234 5678',
    address: '123 Lekki Street',
    city: 'Lagos',
    state: 'Lagos',
    description: 'Premium Nigerian Restaurant - Quality Food & Fast Service',
    bankName: 'Access Bank',
    accountName: 'Food Palace Restaurant',
    accountNumber: '1234567890',
    mondayOpen: '10:00 AM',
    mondayClose: '10:00 PM',
    sundayOpen: '12:00 PM',
    sundayClose: '10:00 PM',
    isOpen: true,
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Save to API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h2 className="text-3xl font-bold text-[#1A1A2E]">Settings</h2>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
          ✅ Settings saved successfully!
        </div>
      )}

      {/* Restaurant Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">
          Restaurant Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              name="restaurantName"
              value={settings.restaurantName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={settings.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={settings.address}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={settings.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
          />
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">
          Operating Hours
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <input
            type="checkbox"
            id="isOpen"
            checked={settings.isOpen}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                isOpen: e.target.checked,
              }))
            }
            className="w-5 h-5 text-[#00A8E8]"
          />
          <label htmlFor="isOpen" className="text-sm font-medium text-gray-700">
            Restaurant is currently {settings.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monday Opening Time
            </label>
            <input
              type="time"
              name="mondayOpen"
              value={settings.mondayOpen}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monday Closing Time
            </label>
            <input
              type="time"
              name="mondayClose"
              value={settings.mondayClose}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sunday Opening Time
            </label>
            <input
              type="time"
              name="sundayOpen"
              value={settings.sundayOpen}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sunday Closing Time
            </label>
            <input
              type="time"
              name="sundayClose"
              value={settings.sundayClose}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">
          Bank Details (For Bank Transfers)
        </h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Keep these details secure. Customers will use this for bank transfers.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name
          </label>
          <input
            type="text"
            name="bankName"
            value={settings.bankName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Name
          </label>
          <input
            type="text"
            name="accountName"
            value={settings.accountName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number
          </label>
          <input
            type="text"
            name="accountNumber"
            value={settings.accountNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
          />
        </div>
      </div>

      {/* Save Button */}
      <div>
        <button
          onClick={handleSave}
          className="w-full bg-[#00A8E8] text-white px-6 py-3 rounded-lg hover:bg-[#0096C7] font-bold text-lg"
        >
          💾 Save All Settings
        </button>
      </div>
    </div>
  );
}