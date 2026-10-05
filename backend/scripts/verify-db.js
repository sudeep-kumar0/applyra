const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verify() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB Atlas at:', uri.split('@')[1].split('/')[0]);
  await mongoose.connect(uri);
  console.log('Connected successfully!');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections in database:', collections.map((c) => c.name));

  const users = await db.collection('users').find({}).toArray();
  console.log('Users count:', users.length);
  for (const u of users) {
    console.log(`- User email: ${u.email} | Role: ${u.role}`);
  }

  const jobs = await db.collection('jobs').find({}).toArray();
  console.log('Jobs in database:', jobs.length);
  for (const j of jobs.slice(0, 5)) {
    console.log(`- Job: "${j.title}" at ${j.company} | Source: ${j.source} | Category: ${j.category} | Active: ${j.isActive}`);
  }

  const apps = await db.collection('applications').find({}).toArray();
  console.log('Applications in database:', apps.length);

  await mongoose.disconnect();
  console.log('All checks passed!');
}

verify().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
