import { formatCurrency } from './currency';
import type { Currency } from '@/types';

export interface AllFees {
  gift_amount: number;
  paystack_fee: number;   // paid by gifter on top of gift amount
  kiima_fee: number;      // deducted from creator via Paystack split
  creator_amount: number; // what creator actually receives
  total_charged: number;  // what Paystack charges the gifter
}

/**
 * Master fee function — always use this, never calculate fees individually.
 * feePercent comes from platform_settings.platform_fee_percent — never hardcode.
 *
 * NGN formula: paystack_fee = min((gift_amount × 1.5%) + ₦100, ₦2,000)
 *
 * calculateAllFees(10000, 3)
 * → { gift_amount: 10000, paystack_fee: 250, kiima_fee: 300,
 *     creator_amount: 9700, total_charged: 10250 }
 */
export function calculateAllFees(giftAmount: number, feePercent: number): AllFees {
  const paystackFee = Math.min(
    Math.round((giftAmount * 0.015 + 100) * 100) / 100,
    2000
  );
  const kiimaFee      = Math.round(giftAmount * (feePercent / 100) * 100) / 100;
  const creatorAmount = Math.round((giftAmount - kiimaFee) * 100) / 100;
  const totalCharged  = Math.round((giftAmount + paystackFee) * 100) / 100;

  return {
    gift_amount:    giftAmount,
    paystack_fee:   paystackFee,
    kiima_fee:      kiimaFee,
    creator_amount: creatorAmount,
    total_charged:  totalCharged,
  };
}

export interface FeeBreakdown {
  giftLine:  string;
  feeLine:   string;
  totalLine: string;
}

/**
 * Human-readable strings for the live fee display in GiftForm / ContributeForm.
 */
export function formatFeeBreakdown(
  giftAmount: number,
  feePercent: number,
  currency: Currency
): FeeBreakdown {
  const fees = calculateAllFees(giftAmount, feePercent);
  return {
    giftLine:  `You're sending ${formatCurrency(fees.gift_amount, currency)}`,
    feeLine:   `Processing fee ${formatCurrency(fees.paystack_fee, currency)}`,
    totalLine: `Total charged ${formatCurrency(fees.total_charged, currency)}`,
  };
}
