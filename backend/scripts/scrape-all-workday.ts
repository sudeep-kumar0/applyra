import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { Job, JobSchema } from '../src/jobs/schemas/job.schema';
import { WorkdayScraperService } from '../src/jobs/scrapers/workday.scraper';
import { WORKDAY_COMPANIES_REGISTRY } from '../src/jobs/scrapers/workday-companies.constants';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  let limit: number | undefined;
  let isDryRun = false;
  let indiaOnly = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--dry-run') {
      isDryRun = true;
    } else if (args[i] === '--all-countries') {
      indiaOnly = false;
    } else if (args[i] === '--india-only') {
      indiaOnly = true;
    }
  }

  console.log(`
============================================================
🚀 Applyra — Automated Workday Daily Batch Scraper
============================================================
Target Companies  : ${WORKDAY_COMPANIES_REGISTRY.length} registered Workday enterprise companies
Filter            : ${indiaOnly ? '🇮🇳 India & Remote Only (Excludes foreign on-site/remotes)' : 'All Countries'}
Limit per company : ${limit || 'All available'}
Dry Run Mode      : ${isDryRun ? 'YES (No DB changes)' : 'NO (Inserting into MongoDB)'}
============================================================
`);

  let jobModel: any = null;
  if (!isDryRun) {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/applyra';
    console.log(`📦 Connecting to MongoDB: ${mongoUri.replace(/:[^:]*@/, ':****@')}...`);
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB.\n');
      const schema = JobSchema;
      jobModel = mongoose.models.Job || mongoose.model(Job.name, schema);
    } catch (err: any) {
      console.error(`❌ Could not connect to MongoDB: ${err.message}`);
      process.exit(1);
    }
  }

  const scraperService = new WorkdayScraperService(jobModel);

  if (isDryRun || !jobModel) {
    console.log('🔍 Executing DRY RUN preview for each company:');
    for (const company of WORKDAY_COMPANIES_REGISTRY) {
      try {
        const preview = await scraperService.previewJobs(company.url, 2, indiaOnly);
        console.log(`\n🏢 ${company.name} (${company.tenant}/${company.site})`);
        console.log(`   Found total: ${preview.totalFound} jobs on board`);
        console.log(`   Sample preview matches (${preview.sampleJobs.length}):`);
        preview.sampleJobs.forEach((j) => {
          console.log(`     • ${j.title} | ${j.location} | ${j.workMode} | ${j.salary || 'Not disclosed'}`);
        });
      } catch (err: any) {
        console.log(`   ❌ Error: ${err.message}`);
      }
    }
    console.log('\n✅ Dry run preview finished. No database changes were made.');
    process.exit(0);
  }

  console.log(`▶ Starting real batch import for ${WORKDAY_COMPANIES_REGISTRY.length} companies...\n`);
  const startTime = Date.now();

  try {
    const batchResult = await scraperService.scrapeAllCompanies({
      indiaOnly,
      limit,
      syncDeactivations: true,
    });

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`
============================================================
📊 Workday Batch Scraping Run Complete! (${durationSec}s)
============================================================
Companies Processed : ${batchResult.successfulCompanies} / ${batchResult.totalCompanies}
Failed Companies    : ${batchResult.failedCompanies}
Total Jobs on Boards: ${batchResult.totalFound}
✨ Newly Imported   : +${batchResult.totalImported}
🔄 Updated Existing : ${batchResult.totalUpdated}
🚫 Skipped / Foreign: ${batchResult.totalSkipped}
============================================================
`);

    if (batchResult.errors.length > 0) {
      console.log('⚠️ Errors encountered:');
      batchResult.errors.forEach((e) => {
        console.log(`  • ${e.company} (${e.boardToken}): ${e.error}`);
      });
    }

    console.log('\n🎉 Finished syncing Workday jobs into database.');
  } catch (err: any) {
    console.error(`❌ Batch scrape failed: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();

