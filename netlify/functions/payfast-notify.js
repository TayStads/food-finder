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

  const { payment_status, custom_str1: userId, custom_str2: plan, token } = params;

  if (payment_status === 'COMPLETE' && userId && plan) {
    const now = new Date();
    let expiresAt = null;
    if (plan === '6month') expiresAt = new Date(now.setMonth(now.getMonth() + 6)).toISOString();
    else if (plan === '12month') expiresAt = new Date(now.setMonth(now.getMonth() + 12)).toISOString();
    else if (plan === 'annual') expiresAt = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();

    await supabase.from('subscriptions').upsert(
      { user_id: userId, plan, status: 'active', payfast_token: token || null, expires_at: expiresAt },
      { onConflict: 'user_id' }
    );
  }

  return { statusCode: 200, body: 'OK' };
};
