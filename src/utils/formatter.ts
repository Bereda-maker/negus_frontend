/**
 * Formats a number as Ethiopian Birr, e.g. 1500 -> "ETB 1,500"
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return '—';
  }
  return `ETB ${Math.round(Number(amount)).toLocaleString('en-US')}`;
};

/**
 * "3 minutes ago", "2 days ago", falling back to a plain date further out.
 */
export const timeAgo = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '';

  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const units = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.seconds);
    if (value >= 1) {
      return `${value} ${unit.label}${value > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
};

/**
 * Format a date with custom options
 * Example: formatDate('2024-01-15') → "Jan 15, 2024"
 */
export const formatDate = (
  dateInput: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  if (!dateInput) return '';
  return new Date(dateInput).toLocaleDateString('en-US', options);
};

/**
 * Truncate text to a maximum length with ellipsis
 * Example: truncate('Very long text...', 10) → "Very long..."
 */
export const truncate = (text: string = '', maxLength: number = 120): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
};

/**
 * Get initials from a full name.
 * Used by the Avatar fallback.
 * Examples:
 *   getInitials('John Doe')   → "JD"
 *   getInitials('John')       → "J"
 *   getInitials('')           → "?"
 *   getInitials(null)         → "?"
 */
export const getInitials = (name: string | null | undefined = ''): string => {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0)?.toUpperCase())
    .join('');

  return initials || '?';
};

// --- Default export for backward compatibility ---
const formatters = {
  formatCurrency,
  timeAgo,
  formatDate,
  truncate,
  getInitials,
};

export default formatters;