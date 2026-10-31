const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const logos = await mongoose.connection.collection('jobs').distinct('companyLogo', { companyLogo: { $exists: true, $ne: '' } });
  console.log('Total unique logo URLs:', logos.length);
  console.log('Sample logo URLs:', logos.slice(0, 15));
  await mongoose.disconnect();
}).catch(console.error);

