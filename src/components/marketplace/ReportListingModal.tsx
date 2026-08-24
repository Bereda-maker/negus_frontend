'use client';

import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { isAxiosError } from 'axios';
import Button from '@/components/ui/Button';
import api from '@/services/api';
import toast from 'react-hot-toast';

const REASONS = [
  { value: 'fraud', label: 'Fraud' },
  { value: 'scam', label: 'Scam' },
  { value: 'fake-product', label: 'Fake / Counterfeit Product' },
  { value: 'not-as-described', label: 'Not as described' },
  { value: 'misleading-description', label: 'Misleading description' },
  { value: 'inappropriate-content', label: 'Inappropriate content' },
  { value: 'offensive-language', label: 'Offensive language' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'wrong-category', label: 'Wrong category' },
  { value: 'illegal-item', label: 'Illegal item' },
  { value: 'prohibited-item', label: 'Prohibited item' },
  { value: 'seller-unresponsive', label: 'Seller unresponsive' },
  { value: 'shipping-issue', label: 'Shipping issue' },
  { value: 'payment-issue', label: 'Payment issue' },
  { value: 'other', label: 'Other' },
];

interface ReportListingModalProps {
  productId: string;
  onClose: () => void;
}

export default function ReportListingModal({ productId, onClose }: ReportListingModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/reports', {
        listingId: productId, // matches the backend field name
        reason,
        description: description.trim(),
      });
      toast.success('Report submitted. Our team will review it.');
      onClose();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      toast.error(message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Report Listing</h2>
          <button onClick={onClose} className="text-textSecondary hover:text-primary transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 transition outline-none"
              required
            >
              <option value="">Select a reason</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Additional details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide more information to help us investigate..."
              className="w-full px-4 py-2 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 transition outline-none"
              maxLength={500}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Submit Report
            </Button>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
