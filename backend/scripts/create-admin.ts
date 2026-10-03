import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { UserRole } from '../src/users/schemas/user.schema';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createAdmin() {
  const args = process.argv.slice(2);
  let targetEmail = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      targetEmail = args[i + 1];
      break;
    }
  }

  if (!targetEmail) {
    console.error('❌ Error: Email is required.');
    console.log('Usage: npm run create-admin -- --email admin@example.com');
    process.exit(1);
  }

  const normalizedEmail = targetEmail.toLowerCase().trim();
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/applyra';

  console.log(`🔌 Connecting to MongoDB...`);
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const usersCollection = mongoose.connection.collection('users');

    const existingUser = await usersCollection.findOne({ email: normalizedEmail });

    if (!existingUser) {
      console.log(`⚠️ User with email ${normalizedEmail} does not exist yet.`);
      console.log(`Creating pre-authorized admin user record in MongoDB...`);
      const now = new Date();
      await usersCollection.insertOne({
        supabaseUserId: `admin_preauth_${Date.now()}`,
        email: normalizedEmail,
        role: UserRole.ADMIN,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });
      console.log(`🎉 Admin user pre-created for ${normalizedEmail}. When they sign up or log in via Supabase Auth, they will have ADMIN permissions.`);
    } else {
      await usersCollection.updateOne(
        { email: normalizedEmail },
        { $set: { role: UserRole.ADMIN, updatedAt: new Date() } },
      );
      console.log(`🎉 Successfully promoted existing user ${normalizedEmail} to role ADMIN.`);
    }

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

createAdmin();
