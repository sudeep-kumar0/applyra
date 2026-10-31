const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigration() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/applyra';
  const maskedHost = uri.includes('@') ? uri.split('@')[1].split('/')[0] : 'localhost';

  console.log(`\n🔌 Connecting to database (${maskedHost})...`);

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected successfully.');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 1. Backfill is_admin: true for any existing ADMIN users
    const adminResult = await usersCollection.updateMany(
      { role: 'ADMIN', is_admin: { $ne: true } },
      { $set: { is_admin: true } }
    );
    console.log(`🛡️  Updated ${adminResult.modifiedCount} admin user(s) -> is_admin: true`);

    // 2. Backfill is_admin: false for any existing users without the field
    const userResult = await usersCollection.updateMany(
      { is_admin: { $exists: false } },
      { $set: { is_admin: false } }
    );
    console.log(`👥 Updated ${userResult.modifiedCount} user(s) without is_admin -> is_admin: false`);

    // 3. Ensure indexes
    await usersCollection.createIndex({ is_admin: 1 }, { background: true });
    console.log('📑 Verified index on "is_admin".');

    console.log('\n🎉 Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();

