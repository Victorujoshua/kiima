export interface PaystackBank {
  name: string;
  code: string;
  slug: string;
}

export async function fetchSupportedBanks(): Promise<PaystackBank[]> {
  const res = await fetch(
    'https://api.paystack.co/bank?currency=NGN&use_cursor=false&perPage=100',
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch banks');
  const json = await res.json();
  return json.data as PaystackBank[];
}

export async function resolveAccountName(accountNumber: string, bankCode: string): Promise<string> {
  const res = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );
  if (!res.ok) throw new Error('Could not verify account number');
  const json = await res.json();
  return json.data.account_name as string;
}

export async function createPaystackSubaccount(params: {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  percentageCharge: number;
}): Promise<string> {
  const res = await fetch('https://api.paystack.co/subaccount', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      business_name: params.businessName,
      settlement_bank: params.bankCode,
      account_number: params.accountNumber,
      percentage_charge: params.percentageCharge,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Subaccount creation failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return json.data.subaccount_code as string;
}
