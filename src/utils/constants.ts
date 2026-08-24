/**
 * Mirrors backend/src/config/constants.js.
 * Kept as a plain frontend file (not a shared package, to keep the
 * hackathon build simple) — if you change one, change the other.
 */

export const USER_ROLES = ['buyer', 'seller', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PRODUCT_CONDITIONS = ['new', 'like-new', 'good', 'fair', 'used'] as const;
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

export const PRODUCT_CONDITION_LABELS: Record<ProductCondition, string> = {
  new: 'New',
  'like-new': 'Like New',
  good: 'Good',
  fair: 'Fair',
  used: 'Used',
};

export const PRODUCT_STATUS = ['active', 'sold', 'pending', 'removed', 'draft'] as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[number];

export const REPORT_REASONS = [
  'fraud',
  'fake-product',
  'inappropriate-content',
  'spam',
  'wrong-category',
  'duplicate',
  'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  fraud: 'Fraud or Scam',
  'fake-product': 'Fake or Counterfeit Product',
  'inappropriate-content': 'Inappropriate Content',
  spam: 'Spam',
  'wrong-category': 'Wrong Category',
  duplicate: 'Duplicate Listing',
  other: 'Other',
};

export const NOTIFICATION_TYPES = [
  'listing_favorited',
  'new_message',
  'new_review',
  'listing_reported',
  'listing_approved',
  'listing_removed',
  'price_drop',
  'system',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const ETHIOPIAN_CITIES = [
  'Addis Ababa',
  'Dire Dawa',
  'Mekelle',
  'Gondar',
  'Bahir Dar',
  'Hawassa',
  'Adama',
  'Jimma',
  'Jijiga',
  'Dessie',
  'Bishoftu',
  'Sodo',
  'Arba Minch',
  'Hosaena',
  'Harar',
] as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 12,
  MAX_LIMIT: 50,
} as const;
