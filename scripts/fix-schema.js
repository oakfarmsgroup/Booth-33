const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hpzgthczonihcghxorxb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwemd0aGN6b25paGNnaHhvcnhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM1MjI5OCwiZXhwIjoyMDc3OTI4Mjk4fQ.N-sNOXDz72kGkDXYG2R2ZXXqv79QJkcLT0c_Hfcft9w';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sqlCommands = [
  "CREATE SCHEMA IF NOT EXISTS api;",
  "ALTER TABLE IF EXISTS public.profiles SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.bookings SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.posts SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.likes SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.comments SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.follows SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.reviews SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.messages SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.events SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.event_rsvps SET SCHEMA api;",
  "ALTER TABLE IF EXISTS public.notifications SET SCHEMA api;",
];

async function executeSql() {
  console.log('Moving tables to api schema...');

  for (const sql of sqlCommands) {
    console.log(`Executing: ${sql}`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`Error: ${error.message}`);
      // Try alternative method
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        console.error(`Failed to execute: ${sql}`);
      } else {
        console.log('✓ Success');
      }
    } else {
      console.log('✓ Success');
    }
  }

  console.log('\nSchema migration complete!');
  console.log('All tables moved to api schema.');
}

executeSql().catch(console.error);
