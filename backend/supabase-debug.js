require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

(async () => {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Test User',
        avatar: null,
        interests: [],
        activities_hosted: 0,
        activities_joined: 0,
        streak: 0,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    .select()
    .single();

  console.log('error', error);
  console.log('data', data);
})();
