interface InitializeParams {
  email: string;
  amount: number;        // in major units (e.g. 5000 NGN) — converted to subunits here
  currency: string;
  metadata?: Record<string, unknown>;
  reference: string;     // caller-generated reference
  callbackUrl: string;
}

interface InitializeResult {
  authorizationUrl: string;
  reference: string;
}

export async function initializePaystackTransaction(
  params: InitializeParams
): Promise<InitializeResult> {
  const { email, amount, currency, metadata, reference, callbackUrl } = params;

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),   // convert to kobo / cents
      currency,
      reference,
      callback_url: callbackUrl,
      metadata: metadata ?? {},
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Paystack initialization failed (${response.status}): ${text}`);
  }

  const json = await response.json() as {
    status: boolean;
    message: string;
    data: { authorization_url: string; reference: string };
  };

  if (!json.status) {
    throw new Error(`Paystack error: ${json.message}`);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference,
  };
}
