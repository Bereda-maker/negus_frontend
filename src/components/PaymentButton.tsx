'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

interface PaymentButtonProps {
  orderId: string;
  amount: number | string;
  disabled?: boolean;
}

export default function PaymentButton({ orderId, amount, disabled }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  // `user` isn't used in the redirect flow itself but callers may rely on
  // this component only rendering inside an authenticated context.
  useAuth();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/payments/initialize', { orderId });
      const { checkoutUrl } = response.data.data;

      // Redirect to Chapa's payment page
      window.location.href = checkoutUrl;
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className="w-full py-3 px-4 bg-gold hover:bg-gold-dark text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Initializing...' : `Pay ${amount} ETB`}
    </button>
  );
}
