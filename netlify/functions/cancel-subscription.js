const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function apiSignature(headers) {
  const str = Object.keys(headers)
    .sort()
    .map(k => `${k}=${encodeURIComponent(String(headers[k])).replace(/%20/g, '+')}`)
    .join('&');
  return crypto.createHash('md5').update(str).digest('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const authHeader = event.headers.authorization || '';
  const accessToken = authHeader.replace('Bearer ', '');
  if (!accessToken) return { statusCode: 401, body: 'Unauthorized' };

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) return { statusCode: 401, body: 'Unauthorized' };

  const { data: record } = await supabase
    .from('users')
    .select('tier, status, payfast_token, period_ends_at')
    .eq('id', user.id)
    .single();

  if (!record || !['monthly', 'annual'].includes(record.tier) || record.status !== 'active') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No cancellable subscription found.' }),
    };
  }

  // Annual is a once-off payment (subscription_type 0) — no recurring billing to stop at PayFast
  if (record.tier === 'annual') {
    await supabase.from('users').update({ status: 'cancelled' }).eq('id', user.id);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, periodEndsAt: record.period_ends_at }),
    };
  }

  // Monthly: call PayFast API to stop future recurring charges
  if (!record.payfast_token) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No billing token on record. Please contact support@pantrytoplate.co.za.' }),
    };
  }

  const timestamp = new Date().toISOString().replace(/\.\d+Z$/, '+02:00');
  const pfHeaders = {
    'merchant-id': process.env.PAYFAST_MERCHANT_ID,
    'passphrase': process.env.PAYFAST_PASSPHRASE,
    'timestamp': timestamp,
    'version': 'v1',
  };
  pfHeaders.signature = apiSignature(pfHeaders);

  try {
    const res = await fetch(`https://api.payfast.co.za/subscriptions/${record.payfast_token}/cancel`, {
      method: 'PUT',
      headers: { ...pfHeaders, 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('PayFast cancel API error:', res.status, body);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'PayFast cancellation failed. Please contact support@pantrytoplate.co.za.' }),
      };
    }

    await supabase.from('users').update({ status: 'cancelled' }).eq('id', user.id);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, periodEndsAt: record.period_ends_at }),
    };
  } catch (err) {
    console.error('cancel-subscription error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal error. Please contact support@pantrytoplate.co.za.' }),
    };
  }
};
