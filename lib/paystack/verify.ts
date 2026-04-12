interface PaystackTransactionData {
  id: number;
  status: string;           // 'success' | 'failed' | 'abandoned'
  reference: string;
  amount: number;           // in subunits (kobo / cents)
  currency: string;
  paid_at: string | null;
  channel: string;
  customer: {
    email: string;
    name: string | null;
  };
  metadata: Record<string, unknown>;
}

interface VerifyResult {
  status: boolean;
  message: string;
  data: PaystackTransactionData;
}

/**
 * Calls Paystack GET /transaction/verify/:reference.
 * Returns the transaction data object on success.
 * Throws on network error, non-OK HTTP status, or Paystack status: false.
 *
 * Used by the admin "re-check payment" feature (recheckPaystackPayment action).
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackTransactionData> {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Paystack verify failed (${response.status}): ${text}`);
  }

  const json = (await response.json()) as VerifyResult;

  if (!json.status) {
    throw new Error(`Paystack verify error: ${json.message}`);
  }

  return json.data;
}
