import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../schemas/job.schema';
import {
  WorkdayCompanyPreset,
  WorkdayJobDetailResponse,
  WorkdayJobListItem,
  WorkdayJobsResponse,
  WorkdayScrapeImportOptions,
  WorkdaySiteConfig,
  ScrapeResult,
  BatchScrapeResult,
} from './scraper.types';
import {
  WORKDAY_COMPANIES_REGISTRY,
  parseWorkdayInput,
  parseWorkdayPostedDate,
} from './workday-companies.constants';
import { isIndiaOrRemote } from './greenhouse-companies.constants';
import { extractSkillsFromText } from './skills.constants';

@Injectable()
export class WorkdayScraperService {
  private readonly logger = new Logger(WorkdayScraperService.name);

  public readonly PRESET_COMPANIES: WorkdayCompanyPreset[] = WORKDAY_COMPANIES_REGISTRY;

  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  /**
   * Returns list of verified preset companies
   */
  getPresets(): WorkdayCompanyPreset[] {
    return this.PRESET_COMPANIES;
  }

  /**
   * Fetches paginated raw jobs from Workday CXS API
   */
  async fetchRawJobs(
    config: WorkdaySiteConfig,
    searchText: string = '',
    limit: number = 20,
    offset: number = 0,
  ): Promise<WorkdayJobsResponse> {
    const { tenant, host, site } = config;
    const url = `https://${tenant}.${host}.myworkdayjobs.com/wday/cxs/${tenant}/${site}/jobs`;

    this.logger.log(`Fetching Workday jobs: ${url} (offset=${offset}, limit=${limit}, search="${searchText}")`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        appliedFacets: {},
        limit,
        offset,
        searchText,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new BadRequestException(
          `Workday career site '${tenant}/${site}' not found (404). Please verify the Workday URL.`,
        );
      }
      throw new BadRequestException(
        `Workday API error (${response.status}): ${response.statusText}`,
      );
    }

    const data = (await response.json()) as WorkdayJobsResponse;
    if (!data || typeof data.total !== 'number') {
      throw new BadRequestException('Unexpected response format from Workday API.');
    }

    return data;
  }

  /**
   * Fetches full job details and description from Workday CXS API
   */
  async fetchJobDetail(
    config: WorkdaySiteConfig,
    externalPath: string,
  ): Promise<WorkdayJobDetailResponse | null> {
    try {
      const { tenant, host, site } = config;
      // externalPath already starts with /job/...
      const url = `https://${tenant}.${host}.myworkdayjobs.com/wday/cxs/${tenant}/${site}${externalPath}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) return null;
      return (await response.json()) as WorkdayJobDetailResponse;
    } catch {
      return null;
    }
  }

  /**
   * Previews up to `limit` jobs without saving to database
   */
  async previewJobs(
    input: string,
    limit: number = 3,
    indiaOnly: boolean = false,
  ): Promise<{ company: string; totalFound: number; sampleJobs: Partial<Job>[] }> {
    const config = parseWorkdayInput(input);
    if (!config) {
      throw new BadRequestException(
        `Invalid Workday input. Please provide a full Workday career URL (e.g. https://adobe.wd5.myworkdayjobs.com/external_experienced) or a recognized preset name.`,
      );
    }

    const preset = this.PRESET_COMPANIES.find(
      (p) => p.tenant.toLowerCase() === config.tenant.toLowerCase(),
    );
    const company = preset?.name || config.tenant.charAt(0).toUpperCase() + config.tenant.slice(1);

    // If searching indiaOnly, searchText = 'India' narrows results at source
    const raw = await this.fetchRawJobs(config, indiaOnly ? 'India' : '', Math.max(limit * 2, 20), 0);
    const jobList = raw.jobPostings || [];

    const filteredSamples: Partial<Job>[] = [];

    for (const item of jobList) {
      if (filteredSamples.length >= limit) break;

      const detail = await this.fetchJobDetail(config, item.externalPath);
      const detailInfo = detail?.jobPostingInfo;

      const rawContent = detailInfo?.jobDescription || '';
      const plainDesc = this.extractPlainText(this.decodeHtmlEntities(rawContent));
      const location = detailInfo?.location || item.locationsText || '';

      if (indiaOnly) {
        const secondaryLocs = [
          ...(detailInfo?.secondaryLocations || []),
          ...(detailInfo?.additionalLocations || []),
        ].map((l) => ({ name: l }));

        const isEligible = isIndiaOrRemote(
          location,
          detailInfo?.title || item.title,
          plainDesc,
          secondaryLocs,
        );

        if (!isEligible) continue;
      }

      const normalized = this.normalizeJob(item, detailInfo, config, {
        companyName: company,
        companyLogo: preset?.logo,
      });

      filteredSamples.push(normalized);
    }

    return {
      company,
      totalFound: raw.total,
      sampleJobs: filteredSamples,
    };
  }

  /**
   * Scrapes and imports jobs from Workday into MongoDB
   */
  async importJobs(options: WorkdayScrapeImportOptions): Promise<ScrapeResult> {
    const { siteUrlOrToken, limit, syncDeactivations, indiaOnly } = options;

    const config = parseWorkdayInput(siteUrlOrToken);
    if (!config) {
      throw new BadRequestException(
        `Invalid Workday input. Please provide a full Workday career URL (e.g. https://adobe.wd5.myworkdayjobs.com/external_experienced) or a recognized preset name.`,
      );
    }

    const preset = this.PRESET_COMPANIES.find(
      (p) => p.tenant.toLowerCase() === config.tenant.toLowerCase(),
    );
    const companyName = options.companyName || preset?.name || config.tenant.charAt(0).toUpperCase() + config.tenant.slice(1);
    const companyLogo = options.companyLogo || preset?.logo || '';

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let totalFound = 0;
    const errors: string[] = [];
    const activeExternalIds: string[] = [];
    const savedJobs: any[] = [];

    const PAGE_SIZE = 20;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      // Check user limit
      if (limit && limit > 0 && imported + updated >= limit) {
        break;
      }

      const response = await this.fetchRawJobs(
        config,
        indiaOnly ? 'India' : '',
        PAGE_SIZE,
        offset,
      );

      totalFound = response.total;
      const jobPostings = response.jobPostings || [];

      if (jobPostings.length === 0) {
        break;
      }

      for (const item of jobPostings) {
        if (limit && limit > 0 && imported + updated >= limit) {
          hasMore = false;
          break;
        }

        try {
          // Fetch full description & rich metadata
          const detail = await this.fetchJobDetail(config, item.externalPath);
          const detailInfo = detail?.jobPostingInfo;

          const rawContent = detailInfo?.jobDescription || '';
          const plainDesc = this.extractPlainText(this.decodeHtmlEntities(rawContent));
          const location = detailInfo?.location || item.locationsText || '';

          if (indiaOnly) {
            const secondaryLocs = [
              ...(detailInfo?.secondaryLocations || []),
              ...(detailInfo?.additionalLocations || []),
            ].map((l) => ({ name: l }));

            const eligible = isIndiaOrRemote(
              location,
              detailInfo?.title || item.title,
              plainDesc,
              secondaryLocs,
            );

            if (!eligible) {
              skipped++;
              continue;
            }
          }

          const normalized = this.normalizeJob(item, detailInfo, config, {
            companyName,
            companyLogo,
            categoryOverride: options.categoryOverride,
          });

          activeExternalIds.push(normalized.externalId);

          // Check if job already exists by externalId
          const existing = await this.jobModel.findOne({ externalId: normalized.externalId });

          if (existing) {
            existing.title = normalized.title;
            existing.description = normalized.description;
            existing.responsibilities = normalized.responsibilities;
            existing.qualifications = normalized.qualifications;
            existing.skills = normalized.skills;
            existing.location = normalized.location;
            existing.workMode = normalized.workMode;
            existing.salary =
              normalized.salary !== 'Not disclosed' ? normalized.salary : existing.salary;
            existing.isActive = true;
            existing.originalUrl = normalized.originalUrl;
            await existing.save();
            updated++;
            savedJobs.push(existing);
          } else {
            // Ensure unique slug
            let slug = normalized.slug;
            const slugExists = await this.jobModel.findOne({ slug });
            if (slugExists) {
              slug = `${slug}-${Date.now().toString().slice(-4)}`;
              normalized.slug = slug;
            }

            const created = await this.jobModel.create(normalized);
            imported++;
            savedJobs.push(created);
          }
        } catch (err: any) {
          skipped++;
          errors.push(`Error saving job ${item.title}: ${err.message}`);
          this.logger.error(`Error saving Workday job ${item.title}: ${err.message}`);
        }
      }

      offset += PAGE_SIZE;
      if (offset >= totalFound) {
        hasMore = false;
      }
    }

    // Deactivation sync if requested
    let deactivated = 0;
    if (syncDeactivations && activeExternalIds.length > 0) {
      const deactivationResult = await this.jobModel.updateMany(
        {
          company: companyName,
          source: 'Workday',
          externalId: { $nin: activeExternalIds },
          isActive: true,
        },
        {
          $set: { isActive: false },
        },
      );
      deactivated = deactivationResult.modifiedCount || 0;
    }

    return {
      company: companyName,
      boardToken: `${config.tenant}/${config.site}`,
      totalFound,
      imported,
      updated,
      deactivated,
      skipped,
      errors,
      jobs: savedJobs.slice(0, 5),
    };
  }

  /**
   * Batch scrapes all verified Workday preset companies
   */
  async scrapeAllCompanies(options: {
    indiaOnly?: boolean;
    limit?: number;
    syncDeactivations?: boolean;
  }): Promise<BatchScrapeResult> {
    const { indiaOnly = true, limit, syncDeactivations = true } = options;

    let successfulCompanies = 0;
    let totalFound = 0;
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    const results: ScrapeResult[] = [];
    const errors: Array<{ company: string; boardToken: string; error: string }> = [];

    this.logger.log(`[Workday Batch] Starting sync across ${this.PRESET_COMPANIES.length} companies...`);

    for (const company of this.PRESET_COMPANIES) {
      try {
        const result = await this.importJobs({
          siteUrlOrToken: company.url,
          companyName: company.name,
          companyLogo: company.logo,
          indiaOnly,
          limit,
          syncDeactivations,
        });

        results.push(result);
        totalFound += result.totalFound;
        totalImported += result.imported;
        totalUpdated += result.updated;
        totalSkipped += result.skipped;
        successfulCompanies++;

        this.logger.log(
          `[Workday] Completed ${company.name}: +${result.imported} imported, ${result.updated} updated, ${result.skipped} filtered/skipped (Total: ${result.totalFound})`,
        );
      } catch (err: any) {
        this.logger.error(`[Workday] Failed ${company.name} (${company.tenant}): ${err.message}`);
        errors.push({
          company: company.name,
          boardToken: company.tenant,
          error: err.message,
        });
      }
    }

    return {
      totalCompanies: this.PRESET_COMPANIES.length,
      successfulCompanies,
      failedCompanies: errors.length,
      totalFound,
      totalImported,
      totalUpdated,
      totalSkipped,
      results,
      errors,
    };
  }

  /**
   * Normalizes raw Workday data into Applyra Job Schema
   */
  public normalizeJob(
    listItem: WorkdayJobListItem,
    detailInfo: any,
    config: WorkdaySiteConfig,
    options: {
      companyName: string;
      companyLogo?: string;
      categoryOverride?: string;
    },
  ): any {
    const rawContent = this.decodeHtmlEntities(detailInfo?.jobDescription || '');
    const plainDescription = this.extractPlainText(rawContent);

    const responsibilities = this.extractSectionBullets(rawContent, [
      'responsibilities',
      "what you'll do",
      'in this role',
      'key responsibilities',
      'the role',
      'what you will do',
      'about the role',
      'duties',
    ]);

    const qualifications = this.extractSectionBullets(rawContent, [
      'requirements',
      'qualifications',
      "what you'll need",
      "what we're looking for",
      'we love to hear from you',
      'minimum qualifications',
      'basic qualifications',
      'who you are',
      'skills & experience',
    ]);

    const title = (detailInfo?.title || listItem.title).trim();
    let locationName = detailInfo?.location || listItem.locationsText || 'India';
    if (['in-office', 'hybrid', 'remote', ''].includes(locationName.toLowerCase())) {
      locationName = 'India';
    }

    const workMode = this.detectWorkMode(title, locationName, plainDescription);
    const jobType = this.detectJobType(title, detailInfo?.timeType, plainDescription);

    const category = options.categoryOverride || this.detectCategory(title);
    const salary = this.extractSalary(rawContent, plainDescription);
    const experience = this.extractExperience(plainDescription);
    const skills = extractSkillsFromText(`${title} ${plainDescription}`);

    // Workday requisition ID
    const reqId =
      detailInfo?.jobReqId ||
      listItem.bulletFields?.[0] ||
      listItem.externalPath.split('_').pop() ||
      Date.now().toString().slice(-6);

    const externalId = `WD-${config.tenant}-${reqId}`;
    const slug = this.generateSlug(title, options.companyName, reqId);

    const originalUrl =
      detailInfo?.externalUrl ||
      `https://${config.tenant}.${config.host}.myworkdayjobs.com/${config.site}${listItem.externalPath}`;

    const postedAt = parseWorkdayPostedDate(detailInfo?.postedOn || listItem.postedOn);

    return {
      title,
      slug,
      company: options.companyName,
      companyId: '',
      companyLogo: options.companyLogo || '',
      description: plainDescription || `${title} at ${options.companyName}`,
      responsibilities:
        responsibilities.length > 0
          ? responsibilities
          : [
              `Deliver high quality engineering and product impact at ${options.companyName}.`,
              'Collaborate with cross-functional team members to execute roadmap priorities.',
              'Contribute to design, technical reviews, and best practices across the organization.',
            ],
      qualifications:
        qualifications.length > 0
          ? qualifications
          : [
              'Relevant industry experience in modern software practices and technologies.',
              'Strong problem-solving and clear verbal and written communication abilities.',
              "Bachelor's degree or equivalent practical industry experience.",
            ],
      skills:
        skills.length > 0
          ? skills.slice(0, 15)
          : ['Software Development', 'Problem Solving', 'Team Collaboration'],
      preferredSkills: [],
      location: locationName,
      salary,
      experience,
      workMode,
      jobType,
      category,
      source: 'Workday',
      originalUrl,
      externalId,
      availableOnSources: ['Company Careers', 'Workday'],
      postedAt,
      isActive: true,
    };
  }

  // --- Normalization Helpers ---

  private generateSlug(title: string, company: string, jobId: string): string {
    const raw = `${title}-${company}-${jobId}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    return raw.slice(0, 100);
  }

  private decodeHtmlEntities(html: string): string {
    if (!html) return '';
    return html
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#x2F;/g, '/')
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  private extractPlainText(html: string): string {
    if (!html) return '';
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private extractSectionBullets(html: string, sectionKeywords: string[]): string[] {
    if (!html) return [];
    const plain = this.decodeHtmlEntities(html);

    for (const kw of sectionKeywords) {
      const regex = new RegExp(
        `(?:<h[1-6][^>]*>|<p[^>]*><strong>|<strong>|<b>)[^<]*${kw}[^<]*(?:<\/strong>|<\/b>|<\/p>|<\/h[1-6]>)([\\s\\S]*?)(?=(?:<h[1-6]|<p[^>]*><strong>|<strong>|<b>)|$)`,
        'i',
      );
      const match = plain.match(regex);
      if (match && match[1]) {
        const sectionContent = match[1];
        const bulletRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        const bullets: string[] = [];
        let bMatch;
        while ((bMatch = bulletRegex.exec(sectionContent)) !== null) {
          const text = this.extractPlainText(bMatch[1]).trim();
          if (text.length > 5 && text.length < 500) {
            bullets.push(text);
          }
        }
        if (bullets.length >= 2) {
          return bullets.slice(0, 8);
        }
      }
    }
    return [];
  }

  private detectWorkMode(title: string, location: string, description: string): string {
    const combined = `${title} ${location} ${description.slice(0, 500)}`.toLowerCase();

    if (
      combined.includes('remote') ||
      combined.includes('work from home') ||
      combined.includes('anywhere') ||
      combined.includes('virtual')
    ) {
      return 'Remote';
    }
    if (combined.includes('hybrid') || combined.includes('flexible')) {
      return 'Hybrid';
    }
    return 'On-site';
  }

  private detectJobType(title: string, timeType?: string, description?: string): string {
    const combined = `${title} ${timeType || ''} ${(description || '').slice(0, 300)}`.toLowerCase();

    if (combined.includes('intern') || combined.includes('co-op') || combined.includes('trainee')) {
      return 'Internship';
    }
    if (combined.includes('contract') || combined.includes('contractor') || combined.includes('temp')) {
      return 'Contract';
    }
    if (combined.includes('part-time') || combined.includes('part time')) {
      return 'Part-time';
    }
    if (combined.includes('apprentice')) {
      return 'Apprenticeship';
    }
    return 'Full-time';
  }

  private detectCategory(title: string): string {
    const t = title.toLowerCase();

    if (
      t.includes('machine learning') ||
      t.includes('ai ') ||
      t.includes('ml ') ||
      t.includes('data scientist') ||
      t.includes('computer vision') ||
      t.includes('nlp') ||
      t.includes('deep learning')
    ) {
      return 'AI/ML';
    }

    if (
      t.includes('devops') ||
      t.includes('sre') ||
      t.includes('site reliability') ||
      t.includes('cloud') ||
      t.includes('infrastructure') ||
      t.includes('platform engineer') ||
      t.includes('kubernetes')
    ) {
      return 'DevOps/Cloud';
    }

    if (
      t.includes('security') ||
      t.includes('infosec') ||
      t.includes('cyber') ||
      t.includes('soc') ||
      t.includes('penetration')
    ) {
      return 'Cybersecurity';
    }

    if (
      t.includes('data engineer') ||
      t.includes('data analyst') ||
      t.includes('bi analyst') ||
      t.includes('database') ||
      t.includes('analytics')
    ) {
      return 'Data';
    }

    if (
      t.includes('qa') ||
      t.includes('quality') ||
      t.includes('test') ||
      t.includes('sdet') ||
      t.includes('automation engineer')
    ) {
      return 'QA/Testing';
    }

    if (t.includes('finance') || t.includes('accountant') || t.includes('tax') || t.includes('audit')) {
      return 'Finance';
    }

    if (t.includes('hr') || t.includes('recruiter') || t.includes('talent') || t.includes('people')) {
      return 'HR';
    }

    if (t.includes('sales') || t.includes('account executive') || t.includes('bdr') || t.includes('sdr')) {
      return 'Sales';
    }

    if (t.includes('marketing') || t.includes('seo') || t.includes('growth') || t.includes('brand')) {
      return 'Marketing';
    }

    if (
      t.includes('support') ||
      t.includes('helpdesk') ||
      t.includes('customer success') ||
      t.includes('service desk')
    ) {
      return 'Customer Support';
    }

    if (
      t.includes('developer') ||
      t.includes('engineer') ||
      t.includes('architect') ||
      t.includes('software') ||
      t.includes('full stack') ||
      t.includes('backend') ||
      t.includes('frontend') ||
      t.includes('mobile') ||
      t.includes('android') ||
      t.includes('ios') ||
      t.includes('web')
    ) {
      return 'Software';
    }

    return 'Software';
  }

  private extractSalary(content: string, plain: string): string {
    const text = `${content} ${plain}`;

    // 1. Check for INR expressions (e.g. ₹15,00,000, 15 LPA, 15-20 Lakhs)
    const inrLpaMatch = text.match(/(?:INR|Rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?|L)/i);
    if (inrLpaMatch) {
      return `₹${inrLpaMatch[1]}–${inrLpaMatch[2]} LPA`;
    }

    const singleLpaMatch = text.match(/(?:INR|Rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?)/i);
    if (singleLpaMatch) {
      return `₹${singleLpaMatch[1]} LPA`;
    }

    // 2. Check for USD expressions ($120,000 - $160,000)
    const usdMatch = text.match(/\$\s*(\d{2,3}(?:,\d{3})+)\s*(?:-|to)\s*\$\s*(\d{2,3}(?:,\d{3})+)/i);
    if (usdMatch) {
      return `$${usdMatch[1]} – $${usdMatch[2]}`;
    }

    const singleUsdMatch = text.match(/\$\s*(\d{2,3}(?:,\d{3})+)/i);
    if (singleUsdMatch) {
      return `$${singleUsdMatch[1]}`;
    }

    return 'Not disclosed';
  }

  private extractExperience(text: string): string {
    const expRegex = /(\d+)\s*(?:-|to|\+)\s*(\d+)?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i;
    const match = text.match(expRegex);

    if (match) {
      const min = parseInt(match[1], 10);
      const max = match[2] ? parseInt(match[2], 10) : null;
      if (max) {
        return `${min}-${max} years`;
      }
      return `${min}+ years`;
    }

    if (/fresher|entry[\s-]level|recent graduate/i.test(text)) {
      return '0-1 years';
    }

    return '1-3 years';
  }
}

