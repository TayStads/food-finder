const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function phpUrlencode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/~/g, '%7E')
    .replace(/\*/g, '%2A')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/%20/g, '+');
}

function validateSignature(params, passphrase) {
  const { signature, ...rest } = params;
  const pfString = Object.keys(rest)
    .sort()
    .filter(k => rest[k] !== '' && rest[k] != null)
    .map(k => `${k}=${phpUrlencode(String(rest[k]))}`)
    .join('&');
  const toHash = passphrase ? `${pfString}&passphrase=${phpUrlencode(passphrase)}` : pfString;
  return crypto.createHash('md5').update(toHash).digest('hex') === signature;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const params = {};
  (event.body || '').split('&').forEach(pair => {
    const [k, v] = pair.split('=').map(s => decodeURIComponent(s?.replace(/\+/g, ' ') || ''));
    if (k) params[k] = v;
  });

  if (!validateSignature(params, process.env.PAYFAST_PASSPHRASE)) {
    return { statusCode: 400, body: 'Invalid signature' };
  }

  const { payment_status, custom_str1: userId, custom_str2: plan, token } = params;

  if (!userId || !plan) return { statusCode: 200, body: 'OK' };

  if (payment_status === 'COMPLETE') {
    const periodEndsAt = new Date();
    if (plan === 'monthly') periodEndsAt.setMonth(periodEndsAt.getMonth() + 1);
    else if (plan === 'annual') periodEndsAt.setFullYear(periodEndsAt.getFullYear() + 1);

    await supabase
      .from('users')
      .update({
        tier: plan,
        status: 'active',
        trial_ends_at: null,
        payfast_token: token || null,
        period_ends_at: periodEndsAt.toISOString(),
      })
      .eq('id', userId);
  }

  // CANCELLED = deliberate cancellation; access continues until period_ends_at (already set)
  if (payment_status === 'CANCELLED') {
    await supabase
      .from('users')
      .update({ status: 'cancelled' })
      .eq('id', userId);
  }

  // FAILED = payment declined; downgrade immediately
  if (payment_status === 'FAILED') {
    await supabase
      .from('users')
      .update({ tier: 'free', status: 'free', trial_ends_at: null, period_ends_at: null })
      .eq('id', userId);
  }

  return { statusCode: 200, body: 'OK' };
};
