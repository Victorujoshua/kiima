import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPaystackSubaccount } from '@/lib/paystack/banks';

export async function POST(req: NextRequest) {
  // Protect: require service role key in Authorization header
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Fetch all profiles that have bank details but a (potentially stale) subaccount code
  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id, username, display_name, bank_code, account_number, paystack_subaccount_code')
    .not('paystack_subaccount_code', 'is', null)
    .not('bank_code', 'is', null)
    .not('account_number', 'is', null);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: 'No profiles to migrate', migrated: 0, failed: 0 });
  }

  const platformFeePercent = 3; // matches platform_settings default

  const results: Array<{
    userId: string;
    username: string;
    oldCode: string;
    newCode?: string;
    status: 'ok' | 'failed';
    error?: string;
  }> = [];

  for (const profile of profiles) {
    try {
      const newCode = await createPaystackSubaccount({
        businessName: profile.display_name || profile.username,
        bankCode: profile.bank_code,
        accountNumber: profile.account_number,
        percentageCharge: platformFeePercent,
      });

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ paystack_subaccount_code: newCode })
        .eq('id', profile.id);

      if (updateError) throw new Error(`DB update failed: ${updateError.message}`);

      results.push({
        userId: profile.id,
        username: profile.username,
        oldCode: profile.paystack_subaccount_code,
        newCode,
        status: 'ok',
      });
    } catch (err) {
      results.push({
        userId: profile.id,
        username: profile.username,
        oldCode: profile.paystack_subaccount_code,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const migrated = results.filter((r) => r.status === 'ok').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  console.log('[migrate-subaccounts] done', { migrated, failed, results });

  return NextResponse.json({ migrated, failed, results });
}
