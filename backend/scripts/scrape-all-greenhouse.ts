import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { Job, JobSchema } from '../src/jobs/schemas/job.schema';
import { GreenhouseScraperService } from '../src/jobs/scrapers/greenhouse.scraper';
import { GREENHOUSE_COMPANIES_REGISTRY } from '../src/jobs/scrapers/greenhouse-companies.constants';

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
🚀 Applyra — Automated Greenhouse Daily Batch Scraper
============================================================
Target Companies  : ${GREENHOUSE_COMPANIES_REGISTRY.length} registered tech companies
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

  const scraperService = new GreenhouseScraperService(jobModel);

  if (isDryRun || !jobModel) {
    console.log(`📋 Running in PREVIEW / DRY-RUN mode across all companies:\n`);
    for (const company of GREENHOUSE_COMPANIES_REGISTRY) {
      try {
        const preview = await scraperService.previewJobs(company.token, 2, indiaOnly);
        console.log(`🏢 ${company.name} (${company.token}): Found ${preview.totalFound} matching jobs`);
        preview.sampleJobs.forEach((j) => {
          console.log(`   - ${j.title} | ${j.location} | ${j.workMode} | ${j.category}`);
        });
      } catch (err: any) {
        console.log(`   ❌ ${company.name}: ${err.message}`);
      }
    }
    console.log(`\n✨ Dry-run preview completed.`);
  } else {
    const startTime = Date.now();
    try {
      console.log(`🔄 Scraping all companies and syncing to MongoDB...\n`);
      const batchResult = await scraperService.scrapeAllCompanies({
        indiaOnly,
        limit,
        syncDeactivations: true,
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`
============================================================
🎉 Batch Scrape Summary
============================================================
  Duration              : ${elapsed}s
  Total Companies       : ${batchResult.totalCompanies}
  Successful Companies  : ${batchResult.successfulCompanies}
  Failed Companies      : ${batchResult.failedCompanies}
  Total Jobs on Boards  : ${batchResult.totalFound}
  Newly Imported (India): ${batchResult.totalImported}
  Updated Existing      : ${batchResult.totalUpdated}
  Filtered / Skipped    : ${batchResult.totalSkipped}
============================================================
`);

      if (batchResult.errors.length > 0) {
        console.log(`⚠️ Errors encountered in ${batchResult.errors.length} companies:`);
        batchResult.errors.forEach((e) => {
          console.log(`  - ${e.company} (${e.boardToken}): ${e.error}`);
        });
      }
    } catch (err: any) {
      console.error(`❌ Batch scrape failed: ${err.message}`);
    } finally {
      await mongoose.disconnect();
      console.log(`\n🔒 Disconnected from MongoDB.`);
    }
  }

  process.exit(0);
}

run();
