import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../src/users/schemas/user.schema';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function askQuestion(query: string, hideInput = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createAdmin() {
  const args = process.argv.slice(2);
  let targetEmail = '';
  let targetPassword = process.env.ADMIN_PASSWORD || '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      targetEmail = args[i + 1];
    }
    if (args[i] === '--password' && args[i + 1]) {
      targetPassword = args[i + 1];
    }
  }

  if (!targetEmail) {
    targetEmail = await askQuestion('Enter admin email address: ');
  }

  if (!targetEmail) {
    console.error('❌ Error: Email is required.');
    console.log('Usage: npm run create-admin -- --email admin@example.com [--password yourPassword]');
    process.exit(1);
  }

  const normalizedEmail = targetEmail.toLowerCase().trim();

  if (!targetPassword) {
    targetPassword = await askQuestion('Enter admin password (min 6 characters): ');
  }

  if (!targetPassword || targetPassword.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters.');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://mytywaubhmpmyyblofri.supabase.co';
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  let supabaseUserId = '';

  if (supabaseSecretKey) {
    console.log('🔐 Configuring Supabase Auth admin user...');
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // Check if user already exists in Supabase Auth
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

      let existingSupabaseUser = listData?.users?.find(
        (u: any) => u.email?.toLowerCase() === normalizedEmail,
      );

      if (existingSupabaseUser) {
        console.log(`Found existing Supabase user ${existingSupabaseUser.id}. Updating credentials & confirming email...`);
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingSupabaseUser.id,
          {
            password: targetPassword,
            email_confirm: true,
          },
        );
        if (updateError) {
          console.warn(`Warning updating Supabase user: ${updateError.message}`);
        } else {
          supabaseUserId = updateData.user.id;
          console.log('✅ Supabase user password updated and email confirmed.');
        }
      } else {
        console.log(`Creating new Supabase Auth user for ${normalizedEmail}...`);
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: targetPassword,
          email_confirm: true,
          user_metadata: { full_name: 'Applyra Administrator' },
        });

        if (createError) {
          console.warn(`Warning creating Supabase user: ${createError.message}`);
        } else {
          supabaseUserId = createData.user.id;
          console.log(`✅ Supabase Auth user created successfully (ID: ${supabaseUserId}).`);
        }
      }
    } catch (sbErr: any) {
      console.warn(`Supabase Auth integration notice: ${sbErr.message}`);
    }
  }

  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/applyra';

  console.log(`🔌 Connecting to MongoDB Atlas...`);
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const usersCollection = mongoose.connection.collection('users');
    const profilesCollection = mongoose.connection.collection('profiles');

    const existingUser = await usersCollection.findOne({ email: normalizedEmail });

    const finalSupabaseId =
      supabaseUserId || existingUser?.supabaseUserId || `admin_${Date.now()}`;

    if (!existingUser) {
      console.log(`Creating new Admin record in MongoDB...`);
      const now = new Date();
      const insertResult = await usersCollection.insertOne({
        supabaseUserId: finalSupabaseId,
        email: normalizedEmail,
        role: UserRole.ADMIN,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });

      await profilesCollection.insertOne({
        userId: insertResult.insertedId,
        fullName: 'Applyra Administrator',
        headline: 'System Administrator',
        location: 'Global',
        skills: ['System Administration', 'Platform Management'],
        profileCompletion: 100,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`🎉 Admin user created in MongoDB with role: ${UserRole.ADMIN}`);
    } else {
      await usersCollection.updateOne(
        { email: normalizedEmail },
        {
          $set: {
            role: UserRole.ADMIN,
            ...(supabaseUserId && { supabaseUserId }),
            updatedAt: new Date(),
          },
        },
      );
      console.log(`🎉 User ${normalizedEmail} successfully promoted to role: ${UserRole.ADMIN}`);
    }

    await mongoose.disconnect();
    console.log('=====================================================');
    console.log(`✅ Administrator successfully set up for: ${normalizedEmail}`);
    console.log('You can now log in at /admin/login');
    console.log('=====================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to configure admin in MongoDB:', error);
    process.exit(1);
  }
}

createAdmin();
