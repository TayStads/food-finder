const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function validateSignature(params, passphrase) {
  const { signature, ...rest } = params;
  const pfString = Object.keys(rest)
    .sort()
    .filter(k => rest[k] !== '' && rest[k] != null)
    .map(k => `${k}=${encodeURIComponent(String(rest[k])).replace(/%20/g, '+')}`)
    .join('&');
  const toHash = passphrase ? `${pfString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}` : pfString;
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

  const { payment_status, custom_str1: userId, custom_str2: plan } = params;

  if (!userId || !plan) return { statusCode: 200, body: 'OK' };

  if (payment_status === 'COMPLETE') {
    await supabase
      .from('users')
      .update({ tier: plan, status: 'active', trial_ends_at: null })
      .eq('id', userId);
  }

  if (payment_status === 'CANCELLED' || payment_status === 'FAILED') {
    await supabase
      .from('users')
      .update({ tier: 'free', status: 'free', trial_ends_at: null })
      .eq('id', userId);
  }

  return { statusCode: 200, body: 'OK' };
};
