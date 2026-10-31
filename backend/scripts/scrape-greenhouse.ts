import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { Job, JobSchema } from '../src/jobs/schemas/job.schema';
import { GreenhouseScraperService } from '../src/jobs/scrapers/greenhouse.scraper';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  let boardToken = '';
  let limit: number | undefined;
  let isDryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--dry-run') {
      isDryRun = true;
    } else if (!args[i].startsWith('-') && !boardToken) {
      boardToken = args[i];
    }
  }

  if (!boardToken) {
    console.log(`
Applyra — Greenhouse Job Scraper CLI
===================================
Usage:
  npx ts-node -r tsconfig-paths/register scripts/scrape-greenhouse.ts <boardToken> [--limit <num>] [--dry-run]

Popular Board Tokens:
  figma, cloudflare, gitlab, reddit, brex, datadog, gusto, doordash, vercel

Examples:
  npx ts-node -r tsconfig-paths/register scripts/scrape-greenhouse.ts figma --limit 5 --dry-run
  npx ts-node -r tsconfig-paths/register scripts/scrape-greenhouse.ts cloudflare --limit 20
    `);
    process.exit(1);
  }

  console.log(`\n🔍 Fetching jobs from Greenhouse board: '${boardToken}'...`);

  // Connect to MongoDB if not dry run
  let jobModel: any = null;
  if (!isDryRun) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/applyra';
    console.log(`📦 Connecting to MongoDB: ${mongoUri.replace(/:[^:]*@/, ':****@')}...`);
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB.');
      const schema = JobSchema;
      jobModel = mongoose.models.Job || mongoose.model(Job.name, schema);
    } catch (err: any) {
      console.warn(`⚠️ Could not connect to MongoDB (${err.message}). Running in preview/dry-run mode.`);
      isDryRun = true;
    }
  }

  const scraperService = new GreenhouseScraperService(jobModel);

  if (isDryRun || !jobModel) {
    console.log(`\n📋 Previewing up to ${limit || 5} jobs (Dry-run mode - no DB writes):`);
    try {
      const preview = await scraperService.previewJobs(boardToken, limit || 5);
      console.log(`\nCompany: ${preview.company}`);
      console.log(`Total active jobs on board: ${preview.totalFound}\n`);

      preview.sampleJobs.forEach((job, index) => {
        console.log(`[${index + 1}] ${job.title}`);
        console.log(`    Location: ${job.location} | Mode: ${job.workMode} | Type: ${job.jobType}`);
        console.log(`    Category: ${job.category} | Salary: ${job.salary}`);
        console.log(`    Skills: ${(job.skills || []).slice(0, 6).join(', ')}`);
        console.log(`    URL: ${job.originalUrl}\n`);
      });

      console.log(`✨ Preview completed successfully.`);
    } catch (err: any) {
      console.error(`❌ Preview failed: ${err.message}`);
    }
  } else {
    try {
      console.log(`\n🚀 Scraping and inserting jobs into MongoDB...`);
      const result = await scraperService.importJobs({
        boardToken,
        limit,
        syncDeactivations: true,
      });

      console.log(`\n========================================`);
      console.log(`🎉 Import Summary for ${result.company} (${result.boardToken})`);
      console.log(`========================================`);
      console.log(`  Total found on board : ${result.totalFound}`);
      console.log(`  Newly imported       : ${result.imported}`);
      console.log(`  Updated existing     : ${result.updated}`);
      console.log(`  Deactivated (closed) : ${result.deactivated}`);
      console.log(`  Skipped / Failed     : ${result.skipped}`);

      if (result.errors.length > 0) {
        console.log(`\n⚠️ Errors encountered:`);
        result.errors.forEach((e) => console.log(`  - ${e}`));
      }

      console.log(`\n✅ Finished successfully!`);
    } catch (err: any) {
      console.error(`❌ Import failed: ${err.message}`);
    } finally {
      await mongoose.disconnect();
    }
  }

  process.exit(0);
}

run();

