'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: 'Suya Shawarma',
    description: 'Delicious grilled meat shawarma with special spices',
    price: 3500,
    category: 'Shawarma',
    stock: 45,
    image: '',
  });

  const [variants, setVariants] = useState([
    { id: '1', name: 'Small', price: 0 },
    { id: '2', name: 'Medium', price: 500 },
    { id: '3', name: 'Large', price: 1000 },
  ]);

  const [addOns, setAddOns] = useState([
    { id: '1', name: 'Extra Meat', price: 1500 },
    { id: '2', name: 'Cheese', price: 500 },
    { id: '3', name: 'Sauce Upgrade', price: 300 },
  ]);

  const [newVariant, setNewVariant] = useState({ name: '', price: 0 });
  const [newAddOn, setNewAddOn] = useState({ name: '', price: 0 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseInt(value) : value,
    }));
  };

  const handleAddVariant = () => {
    if (newVariant.name) {
      setVariants([
        ...variants,
        { id: Date.now().toString(), ...newVariant },
      ]);
      setNewVariant({ name: '', price: 0 });
    }
  };

  const handleAddAddOn = () => {
    if (newAddOn.name) {
      setAddOns([...addOns, { id: Date.now().toString(), ...newAddOn }]);
      setNewAddOn({ name: '', price: 0 });
    }
  };

  const handleDeleteVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleDeleteAddOn = (id: string) => {
    setAddOns(addOns.filter((a) => a.id !== id));
  };

  const handleSave = async () => {
    try {
      // TODO: Save to API
      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      alert('Failed to update product');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-[#1A1A2E]">Edit Product</h2>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-[#1A1A2E] mb-4">Basic Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₦)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00A8E8]"
          >
            <option>Shawarma</option>
            <option>Burgers</option>
            <option>Rice</option>
            <option>Soup & Swallow</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-[#1A1A2E]">Product Variants</h3>

        <div className="space-y-2">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
            >
              <div>
                <p className="font-medium text-[#1A1A2E]">{variant.name}</p>
                <p className="text-sm text-gray-600">
                  +₦{variant.price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteVariant(variant.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Add New Variant</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Variant name"
              value={newVariant.name}
              onChange={(e) =>
                setNewVariant({ ...newVariant, name: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Extra price"
              value={newVariant.price}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  price: parseInt(e.target.value) || 0,
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleAddVariant}
            className="w-full bg-[#00A8E8] text-white px-4 py-2 rounded-lg hover:bg-[#0096C7]"
          >
            Add Variant
          </button>
        </div>
      </div>

      {/* Add-ons */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-[#1A1A2E]">Add-ons</h3>

        <div className="space-y-2">
          {addOns.map((addOn) => (
            <div
              key={addOn.id}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
            >
              <div>
                <p className="font-medium text-[#1A1A2E]">{addOn.name}</p>
                <p className="text-sm text-gray-600">
                  ₦{addOn.price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAddOn(addOn.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Add New Add-on</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Add-on name"
              value={newAddOn.name}
              onChange={(e) =>
                setNewAddOn({ ...newAddOn, name: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Price"
              value={newAddOn.price}
              onChange={(e) =>
                setNewAddOn({
                  ...newAddOn,
                  price: parseInt(e.target.value) || 0,
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleAddAddOn}
            className="w-full bg-[#00A8E8] text-white px-4 py-2 rounded-lg hover:bg-[#0096C7]"
          >
            Add Add-on
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-[#00A8E8] text-white px-6 py-3 rounded-lg hover:bg-[#0096C7] font-bold text-lg"
        >
          💾 Save Changes
        </button>
        <button
          onClick={() => router.push('/admin/products')}
          className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-bold text-lg"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}
