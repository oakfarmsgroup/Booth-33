const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase connection configuration
const client = new Client({
  host: 'aws-0-us-east-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.hpzgthczonihcghxorxb',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwemd0aGN6b25paGNnaHhvcnhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM1MjI5OCwiZXhwIjoyMDc3OTI4Mjk4fQ.N-sNOXDz72kGkDXYG2R2ZXXqv79QJkcLT0c_Hfcft9w',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('🔄 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'supabase', 'fix_schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      if (statement.trim()) {
        const preview = statement.substring(0, 80).replace(/\n/g, ' ');
        console.log(`Executing: ${preview}...`);
        await client.query(statement);
        console.log('✅ Success\n');
      }
    }

    console.log('🎉 Schema migration complete!');
    console.log('✅ All tables moved to api schema.');
    console.log('\n📊 Verifying tables in api schema...');

    // Verify tables are in api schema
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'api'
      ORDER BY table_name
    `);

    console.log(`\nFound ${result.rows.length} tables in api schema:`);
    result.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

migrate()
  .then(() => {
    console.log('\n✅ Migration successful!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
