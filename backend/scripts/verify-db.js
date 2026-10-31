const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verify() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
  }

  const maskedHost = uri.includes('@') ? uri.split('@')[1].split('/')[0] : 'localhost';
  console.log(`\n📦 Connecting to MongoDB Atlas (${maskedHost})...`);
  await mongoose.connect(uri);
  console.log('✅ Connected successfully!\n');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('📂 Collections in database:', collections.map((c) => c.name).join(', '));
  console.log('--------------------------------------------------');

  // Users
  const userCount = await db.collection('users').countDocuments();
  console.log(`👤 Users count: ${userCount}`);
  const users = await db.collection('users').find({}).limit(5).toArray();
  for (const u of users) {
    console.log(`   - ${u.email} | Role: ${u.role}`);
  }

  // Jobs
  const totalJobs = await db.collection('jobs').countDocuments();
  const activeJobs = await db.collection('jobs').countDocuments({ isActive: true });
  console.log(`\n💼 Jobs in database: ${totalJobs} total (${activeJobs} active)`);
  
  // Sources breakdown
  const sources = await db.collection('jobs').aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } }
  ]).toArray();
  console.log('   Sources breakdown:');
  sources.forEach(s => console.log(`   • ${s._id}: ${s.count} jobs`));

  // Top companies
  const companies = await db.collection('jobs').aggregate([
    { $group: { _id: '$company', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]).toArray();
  console.log('   Top companies:');
  companies.forEach(c => console.log(`   • ${c._id}: ${c.count} jobs`));

  // Sample jobs
  console.log('\n📄 Sample recent jobs:');
  const sampleJobs = await db.collection('jobs').find({}).sort({ postedAt: -1 }).limit(3).toArray();
  sampleJobs.forEach((j, idx) => {
    console.log(`   [${idx + 1}] "${j.title}" at ${j.company}`);
    console.log(`       Location: ${j.location} | Mode: ${j.workMode} | Category: ${j.category}`);
    console.log(`       Salary: ${j.salary} | Skills: ${(j.skills || []).slice(0, 5).join(', ')}`);
    console.log(`       Source: ${j.source} | URL: ${j.originalUrl}`);
  });

  // Applications
  const appsCount = await db.collection('applications').countDocuments();
  console.log(`\n📝 Applications count: ${appsCount}`);

  await mongoose.disconnect();
  console.log('\n✨ Database inspection complete!\n');
}

verify().catch((err) => {
  console.error('❌ Verification error:', err.message);
  process.exit(1);
});
