'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface DeliveryAddress {
  id: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  zone?: {
    id: string;
    name: string;
    fee: number;
  };
}

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  totalPrice: number;
}

interface Cart {
  items: CartItem[];
  subTotal: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [customerNote, setCustomerNote] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCart();
    fetchAddresses();
  }, [token, router]);

  const fetchCart = async () => {
    try {
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCart(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart');
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('/api/delivery-addresses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const addressList = response.data.data;
        setAddresses(addressList);

        // Auto-select default address
        const defaultAddress = addressList.find((a: DeliveryAddress) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setDeliveryFee(defaultAddress.zone?.fee || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = addresses.find((a) => a.id === addressId);
    if (address) {
      setDeliveryFee(address.zone?.fee || 0);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        '/api/orders',
        {
          deliveryAddressId: selectedAddressId,
          paymentMethod,
          customerNote,
          orderType: 'DELIVERY',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Redirect to order confirmation
        router.push(`/orders/${response.data.data.order.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8E8]"></div>
      </div>
    );
  }

  const subTotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round((subTotal * 7.5) / 100 * 100) / 100;
  const total = subTotal + deliveryFee + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Cart Review */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Review</h2>

              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₦{item.totalPrice.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">No delivery addresses saved</p>
                  <button
                    onClick={() => router.push('/profile/addresses')}
                    className="text-[#00A8E8] hover:text-[#0096C7] font-medium transition"
                  >
                    Add an address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label key={address.id} className="flex items-start p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#00A8E8] transition">
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => handleAddressChange(address.id)}
                        className="mt-1 w-4 h-4"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">
                          {address.label || 'Delivery Address'}
                          {address.isDefault && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.state} {address.postalCode}
                        </p>
                        {address.zone && (
                          <p className="text-sm text-[#00A8E8]">Zone: {address.zone.name}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>

              <div className="space-y-3">
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#00A8E8] transition">
                  <input
                    type="radio"
                    name="payment"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when your order arrives</p>
                  </div>
                </label>

                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#00A8E8] transition">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Debit/Credit Card</p>
                    <p className="text-sm text-gray-600">Via Paystack</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Special Instructions</h2>

              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Any special requests or instructions for the delivery?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A8E8] focus:border-transparent outline-none resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₦{subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>₦{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (7.5%)</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-[#00A8E8]">₦{total.toLocaleString()}</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || !selectedAddressId}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#00A8E8] to-[#0096C7] text-white font-semibold rounded-lg hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Place Order - ₦${total.toLocaleString()}`}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full py-3 px-4 border-2 border-[#00A8E8] text-[#00A8E8] font-semibold rounded-lg hover:bg-blue-50 transition duration-200"
                >
                  Continue Shopping
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-900 font-medium">✓ Secure checkout</p>
                <p className="text-xs text-blue-800 mt-1">Your order is protected by our guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
