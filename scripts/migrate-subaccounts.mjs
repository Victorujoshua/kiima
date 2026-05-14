import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY

async function createSubaccount(profile) {
  const res = await fetch('https://api.paystack.co/subaccount', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      business_name: profile.display_name || profile.username,
      settlement_bank: profile.bank_code,
      account_number: profile.account_number,
      percentage_charge: 3,
    }),
  })
  return res.json()
}

async function run() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, bank_code, account_number, paystack_subaccount_code')
    .not('bank_code', 'is', null)
    .not('account_number', 'is', null)

  console.log(`Found ${profiles.length} creators to migrate`)

  for (const profile of profiles) {
    try {
      const result = await createSubaccount(profile)

      if (result.status && result.data?.subaccount_code) {
        await supabase
          .from('profiles')
          .update({ paystack_subaccount_code: result.data.subaccount_code })
          .eq('id', profile.id)

        console.log(`✓ ${profile.username} → ${result.data.subaccount_code}`)
      } else {
        console.log(`✗ ${profile.username} failed:`, result.message)
      }
    } catch (err) {
      console.log(`✗ ${profile.username} error:`, err.message)
    }
  }

  console.log('Done.')
}

run()
