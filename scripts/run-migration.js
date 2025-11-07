const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase connection using direct database connection
// Note: This requires the DATABASE_URL from Supabase project settings
const connectionString = 'postgresql://postgres.hpzgthczonihcghxorxb:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function runMigration(migrationFile) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the migration file
    const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log(`📝 Executing migration: ${migrationFile}\n`);

    // Execute the entire SQL content as a single transaction
    await client.query('BEGIN');

    try {
      await client.query(sqlContent);
      await client.query('COMMIT');
      console.log('✅ Migration executed successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    // Verify tables were created
    console.log('\n📊 Verifying new tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('sessions', 'session_files', 'user_settings')
      ORDER BY table_name
    `);

    console.log(`\nFound ${result.rows.length} new tables:`);
    result.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run migration
const migrationFile = process.argv[2] || '20251107_add_user_features.sql';
runMigration(migrationFile)
  .then(() => {
    console.log('\n✅ Migration complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
