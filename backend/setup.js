const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Setting up Permit Management Database...\n');

  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log('📊 Creating database and tables...');
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('✅ Database schema created successfully');
    console.log('📋 Tables created:');
    console.log('   - clients');
    console.log('   - permits');
    console.log('   - filter_presets');
    console.log('   - automations');
    console.log('   - export_history');
    console.log('   - Sample data inserted');

    await connection.end();
    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Start the backend: npm run dev');
    console.log('2. Start the frontend: cd .. && npm run dev');
    console.log('3. Visit: http://localhost:8080');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Ensure you have permission to create databases');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
