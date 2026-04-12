import type { Currency } from '@/types';

/**
 * formatCurrency(amount, currency)
 * Always use this. Never manually concatenate symbols + numbers.
 *
 * formatCurrency(5000, 'NGN')  → "₦5,000"
 * formatCurrency(20,   'USD')  → "$20.00"
 * formatCurrency(15,   'GBP')  → "£15.00"
 * formatCurrency(20,   'EUR')  → "€20.00"
 *
 * NGN uses 0 decimal places (whole naira).
 * USD / GBP / EUR use 2 decimal places.
 * Manual symbol prefix guarantees the correct character regardless of
 * the Node.js ICU build available in the deployment environment.
 */
export function formatCurrency(amount: number, currency: Currency | string): string {
  switch (currency) {
    case 'NGN':
      return `₦${amount.toLocaleString('en', { maximumFractionDigits: 0 })}`;
    case 'USD':
      return `$${amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'GBP':
      return `£${amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€${amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return `${currency} ${amount}`;
  }
}
