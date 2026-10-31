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

    // 1. By default, every user without is_admin === true must be is_admin: false
    // Covers missing field, null, undefined, or empty values
    const defaultFalseResult = await usersCollection.updateMany(
      { is_admin: { $ne: true } },
      { $set: { is_admin: false } }
    );
    console.log(`👥 Defaulted ${defaultFalseResult.matchedCount} user(s) -> is_admin: false`);

    // 2. Ensure all non-ADMIN role users are strictly is_admin: false
    const nonAdminResult = await usersCollection.updateMany(
      { role: { $ne: 'ADMIN' } },
      { $set: { is_admin: false } }
    );
    console.log(`🔒 Verified ${nonAdminResult.matchedCount} non-admin user(s) -> is_admin: false`);

    // 3. Backfill is_admin: true ONLY for verified ADMIN role users
    const adminResult = await usersCollection.updateMany(
      { role: 'ADMIN', is_admin: { $ne: true } },
      { $set: { is_admin: true } }
    );
    console.log(`🛡️  Updated ${adminResult.modifiedCount} admin user(s) with role 'ADMIN' -> is_admin: true`);

    // 4. Ensure index on is_admin for performant queries
    await usersCollection.createIndex({ is_admin: 1 }, { background: true });
    console.log('📑 Verified index on "is_admin".');

    // 5. Verification summary
    const totalUsers = await usersCollection.countDocuments();
    const adminCount = await usersCollection.countDocuments({ is_admin: true });
    const standardUsersCount = await usersCollection.countDocuments({ is_admin: false });

    console.log(`\n📊 Database State Summary:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Admins (is_admin: true): ${adminCount}`);
    console.log(`   Standard Users (is_admin: false): ${standardUsersCount}`);

    console.log('\n🎉 Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();

