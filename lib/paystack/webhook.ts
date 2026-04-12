import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies the x-paystack-signature header against the raw request body.
 * Uses HMAC-SHA512 with PAYSTACK_WEBHOOK_SECRET.
 * Uses timingSafeEqual to prevent timing attacks.
 * Returns false immediately if the secret is not configured.
 */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature,  'hex')
    );
  } catch {
    // Buffer lengths differ — signature is malformed
    return false;
  }
}
