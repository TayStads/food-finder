const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const { userId } = JSON.parse(event.body || '{}');
  if (!userId) return { statusCode: 400, body: 'Missing userId' };

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { statusCode: 500, body: error.message };

  return { statusCode: 200, body: 'OK' };
};
