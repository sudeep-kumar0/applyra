const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables not found.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let email = args[0];
  let password = args[1];

  console.log('\n🔑 Applyra - Get Postman Bearer Token');
  console.log('====================================');

  if (!email) {
    email = await askQuestion('Enter your Admin email: ');
  }
  if (!password) {
    password = await askQuestion('Enter your Admin password: ');
  }

  if (!email || !password) {
    console.error('❌ Email and password are required.');
    process.exit(1);
  }

  console.log(`\nLogging in as ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    process.exit(1);
  }

  const token = data.session.access_token;

  console.log('✅ Authentication successful!\n');
  console.log('📋 Copy this Bearer Token into Postman:\n');
  console.log(token);
  console.log('\n----------------------------------------------------');
  console.log('How to use in Postman:');
  console.log('1. Go to the "Authorization" tab in Postman');
  console.log('2. Select Type: "Bearer Token"');
  console.log('3. Paste the token above in the "Token" field');
  console.log('4. Send GET {{Base_URL}}/api/v1/admin/stats');
  console.log('----------------------------------------------------\n');
}

main().catch(console.error);

