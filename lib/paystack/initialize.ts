interface InitializeParams {
  email: string;
  amount: number;           // total_charged in major units — converted to subunits here
  currency: string;
  metadata?: Record<string, unknown>;
  reference: string;
  callbackUrl: string;
  subaccountCode?: string;    // V2: creator's Paystack subaccount code
  transactionCharge?: number; // V2: kiima fee split in major units
}

interface InitializeResult {
  authorizationUrl: string;
  reference: string;
}

export async function initializePaystackTransaction(
  params: InitializeParams
): Promise<InitializeResult> {
  const { email, amount, currency, metadata, reference, callbackUrl, subaccountCode, transactionCharge } = params;

  const body: Record<string, unknown> = {
    email,
    amount: Math.round(amount * 100),   // convert to kobo / cents
    currency,
    reference,
    callback_url: callbackUrl,
    metadata: metadata ?? {},
  };

  // V2: Paystack split payment via subaccount
  if (subaccountCode) {
    body.subaccount = subaccountCode;
    body.bearer = 'account'; // Kiima bears Paystack fee at API level (already charged to gifter)
  }
  if (transactionCharge != null) {
    body.transaction_charge = Math.round(transactionCharge * 100); // kiima split in kobo
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
