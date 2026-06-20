const crypto = require('crypto');

const PLAN_CONFIG = {
  monthly: {
    name: 'Monthly Plan',
    amount: '45.00',
    recurring_amount: '45.00',
    frequency: 3,
    cycles: 0,
    subscription_type: 1,
  },
  annual: {
    name: 'Annual Plan',
    amount: '399.00',
    subscription_type: 0,
  },
};

// Match PHP's urlencode() which PayFast uses server-side for signature verification.
// encodeURIComponent does not encode !, ~, *, (, ) but PHP urlencode does.
function phpUrlencode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/~/g, '%7E')
    .replace(/\*/g, '%2A')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/%20/g, '+');
}

function generateSignature(params, passphrase) {
  const pfString = Object.keys(params)
    .sort()
    .filter(k => params[k] !== '' && params[k] != null)
    .map(k => `${k}=${phpUrlencode(String(params[k]))}`)
    .join('&');

  const toHash = passphrase ? `${pfString}&passphrase=${phpUrlencode(passphrase)}` : pfString;
  return crypto.createHash('md5').update(toHash).digest('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const { plan, userId, email, name } = JSON.parse(event.body || '{}');
  const config = PLAN_CONFIG[plan];
  if (!config) return { statusCode: 400, body: 'Invalid plan' };

  const sandbox = process.env.PAYFAST_SANDBOX === 'true';
  const baseUrl = process.env.URL || 'https://pantrytoplate.co.za';
  const nameParts = (name || '').split(' ');

  const params = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: `${baseUrl}/app/payment/return`,
    cancel_url: `${baseUrl}/app/payment/cancel`,
    notify_url: `${baseUrl}/app/payment/notify`,
    name_first: nameParts[0] || '',
    name_last: nameParts.slice(1).join(' ') || '',
    email_address: email,
    m_payment_id: `${userId}-${plan}-${Date.now()}`,
    amount: config.amount,
    item_name: `Pantry to Plate ${config.name}`,
    custom_str1: userId,
    custom_str2: plan,
  };

  if (config.subscription_type === 1) {
    const today = new Date();
    params.subscription_type = '1';
    params.billing_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    params.recurring_amount = config.recurring_amount;
    params.frequency = String(config.frequency);
    params.cycles = String(config.cycles);
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  params.signature = generateSignature(params, passphrase);

  // Temporary debug logging — remove before going live
  const pfString = Object.keys(params)
    .filter(k => k !== 'signature')
    .sort()
    .filter(k => params[k] !== '' && params[k] != null)
    .map(k => `${k}=${phpUrlencode(String(params[k]))}`)
    .join('&');
  console.log('[PayFast Debug] merchant_id:', params.merchant_id);
  console.log('[PayFast Debug] passphrase set:', passphrase ? `YES (${passphrase.length} chars)` : 'NO');
  console.log('[PayFast Debug] pfString:', pfString);
  console.log('[PayFast Debug] signature:', params.signature);

  // Only send fields that were included in the signature (no empty strings).
  const fields = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      formUrl: sandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process',
      fields,
    }),
  };
};
