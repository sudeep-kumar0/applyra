import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GreenhouseScraperService } from './scrapers/greenhouse.scraper';
import { BatchScrapeResult } from './scrapers/scraper.types';

@Injectable()
export class GreenhouseCronService {
  private readonly logger = new Logger(GreenhouseCronService.name);
  private isRunning = false;
  private lastRunTime: Date | null = null;
  private lastRunResult: BatchScrapeResult | null = null;

  constructor(private readonly scraperService: GreenhouseScraperService) {}

  /**
   * Daily Cron Schedule:
   * Fires every day at 02:00 AM server time (0 2 * * *)
   */
  @Cron('0 2 * * *')
  async handleDailyCron() {
    this.logger.log('⏰ Triggered scheduled daily Greenhouse scrape for India & Remote jobs.');
    try {
      await this.runBatchScrape({
        indiaOnly: true,
        syncDeactivations: true,
      });
    } catch (err: any) {
      this.logger.error(`Daily Greenhouse cron job failed: ${err.message}`, err.stack);
    }
  }

  /**
   * Runs the batch scraper across all registered companies.
   * Can be triggered on-demand via the Admin API or automatically by the daily cron.
   */
  async runBatchScrape(options: {
    indiaOnly?: boolean;
    limit?: number;
    syncDeactivations?: boolean;
  } = {}): Promise<BatchScrapeResult> {
    if (this.isRunning) {
      throw new Error(
        'A Greenhouse batch scrape job is already currently in progress. Please wait for it to complete.',
      );
    }

    this.isRunning = true;
    try {
      this.logger.log(
        `Starting Greenhouse batch scrape job (India & Remote: ${options.indiaOnly !== false})...`,
      );
      const result = await this.scraperService.scrapeAllCompanies({
        indiaOnly: options.indiaOnly !== false,
        limit: options.limit,
        syncDeactivations: options.syncDeactivations ?? true,
      });

      this.lastRunResult = result;
      this.lastRunTime = new Date();

      this.logger.log(
        `✅ Greenhouse batch scrape completed: +${result.totalImported} imported, ${result.totalUpdated} updated, ${result.totalSkipped} skipped across ${result.successfulCompanies}/${result.totalCompanies} companies.`,
      );

      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Returns current scheduler & last-run status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: 'Daily at 02:00 AM (0 2 * * *)',
      lastRunTime: this.lastRunTime,
      lastRunResult: this.lastRunResult
        ? {
            totalCompanies: this.lastRunResult.totalCompanies,
            successfulCompanies: this.lastRunResult.successfulCompanies,
            failedCompanies: this.lastRunResult.failedCompanies,
            totalFound: this.lastRunResult.totalFound,
            totalImported: this.lastRunResult.totalImported,
            totalUpdated: this.lastRunResult.totalUpdated,
            totalSkipped: this.lastRunResult.totalSkipped,
            errorsCount: this.lastRunResult.errors.length,
          }
        : null,
    };
  }
}

