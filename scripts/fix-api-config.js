// Instead of moving tables, let's just update the Supabase client config
// to use the public schema by default

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating Supabase client configuration...\n');

const supabaseConfigPath = path.join(__dirname, '..', 'config', 'supabase.js');
let config = fs.readFileSync(supabaseConfigPath, 'utf8');

// Check if db.schema is already set
if (config.includes('db:')) {
  console.log('✅ Configuration already has db settings');
} else {
  // Add schema configuration
  config = config.replace(
    'export const supabase = createClient(supabaseUrl, supabaseAnonKey, {',
    `export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },`
  );

  fs.writeFileSync(supabaseConfigPath, config);
  console.log('✅ Updated config/supabase.js to use "public" schema');
}

console.log('\n🎉 Configuration updated!');
console.log('The app will now correctly access tables in the public schema.');
console.log('\nPlease restart the Expo server for changes to take effect.');
