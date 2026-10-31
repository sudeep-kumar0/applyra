import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../schemas/job.schema';
import {
  GreenhouseBoardInfo,
  GreenhouseJobResponse,
  ScrapeImportOptions,
  ScrapeResult,
  BatchScrapeResult,
} from './scraper.types';
import { extractSkillsFromText } from './skills.constants';
import {
  GREENHOUSE_COMPANIES_REGISTRY,
  isIndiaOrRemote,
  GreenhouseCompanyPreset,
} from './greenhouse-companies.constants';

@Injectable()
export class GreenhouseScraperService {
  private readonly logger = new Logger(GreenhouseScraperService.name);

  // Registry of verified companies with Greenhouse board tokens
  public readonly PRESET_COMPANIES: GreenhouseCompanyPreset[] = GREENHOUSE_COMPANIES_REGISTRY;

  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  /**
   * Returns list of preset companies
   */
  getPresets(): GreenhouseCompanyPreset[] {
    return this.PRESET_COMPANIES;
  }

  /**
   * Fetches the board metadata from Greenhouse API
   */
  async fetchBoardInfo(boardToken: string): Promise<GreenhouseBoardInfo | null> {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      return (await response.json()) as GreenhouseBoardInfo;
    } catch {
      return null;
    }
  }

  /**
   * Fetches raw jobs list from Greenhouse
   */
  async fetchRawJobs(boardToken: string): Promise<GreenhouseJobResponse> {
    const cleanToken = boardToken
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\/.*boards\.greenhouse\.io\//, '')
      .replace(/\/.*$/, '');
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(cleanToken)}/jobs?content=true`;

    this.logger.log(`Fetching Greenhouse jobs from: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new BadRequestException(
          `Greenhouse board '${cleanToken}' not found. Please verify the company board token.`,
        );
      }
      throw new BadRequestException(
        `Greenhouse API error (${response.status}): ${response.statusText}`,
      );
    }

    const data = (await response.json()) as GreenhouseJobResponse;
    if (!data || !Array.isArray(data.jobs)) {
      throw new BadRequestException(`Unexpected Greenhouse API response format.`);
    }

    return data;
  }

  /**
   * Previews up to `limit` parsed jobs without inserting into database
   */
  async previewJobs(
    boardToken: string,
    limit: number = 3,
    indiaOnly: boolean = false,
  ): Promise<{ company: string; totalFound: number; sampleJobs: Partial<Job>[] }> {
    const raw = await this.fetchRawJobs(boardToken);
    const boardInfo = await this.fetchBoardInfo(boardToken);
    const company = boardInfo?.name || boardToken;

    let filteredJobs = raw.jobs;
    if (indiaOnly) {
      filteredJobs = raw.jobs.filter((rawJob) => {
        const plainDesc = this.extractPlainText(
          this.decodeHtmlEntities(rawJob.content || ''),
        );
        return isIndiaOrRemote(
          rawJob.location?.name || '',
          rawJob.title,
          plainDesc,
          rawJob.offices || [],
        );
      });
    }

    const sample = filteredJobs.slice(0, Math.min(limit, filteredJobs.length)).map((rawJob) =>
      this.normalizeJob(rawJob, {
        boardToken,
        companyName: company,
      }),
    );

    return {
      company,
      totalFound: filteredJobs.length,
      sampleJobs: sample,
    };
  }

  /**
   * Scrapes and imports jobs from Greenhouse into MongoDB
   */
  async importJobs(options: ScrapeImportOptions): Promise<ScrapeResult> {
    const { boardToken, limit, syncDeactivations, indiaOnly } = options;
    const raw = await this.fetchRawJobs(boardToken);
    const boardInfo = await this.fetchBoardInfo(boardToken);

    // Resolve company name and logo from presets or board metadata
    const preset = this.PRESET_COMPANIES.find(
      (p) => p.token.toLowerCase() === boardToken.toLowerCase(),
    );
    const companyName = options.companyName || preset?.name || boardInfo?.name || boardToken;
    const companyLogo = options.companyLogo || preset?.logo || '';

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];
    const activeExternalIds: string[] = [];
    const savedJobs: any[] = [];

    for (const rawJob of raw.jobs) {
      // Check limit if specified
      if (limit && limit > 0 && imported + updated >= limit) {
        break;
      }

      try {
        const rawContent = this.decodeHtmlEntities(rawJob.content || '');
        const plainDesc = this.extractPlainText(rawContent);

        // Apply India & Remote filter if enabled
        if (indiaOnly) {
          const eligible = isIndiaOrRemote(
            rawJob.location?.name || '',
            rawJob.title,
            plainDesc,
            rawJob.offices || [],
          );
          if (!eligible) {
            skipped++;
            continue;
          }
        }

        const normalized = this.normalizeJob(rawJob, {
          ...options,
          companyName,
          companyLogo,
        });

        activeExternalIds.push(normalized.externalId);

        // Check if job already exists
        const existing = await this.jobModel.findOne({ externalId: normalized.externalId });

        if (existing) {
          // Update mutable fields (preserving user interactions and slug)
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
          // Check slug uniqueness
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
        errors.push(`Error saving job ${rawJob.title}: ${err.message}`);
        this.logger.error(`Error saving Greenhouse job ${rawJob.id}: ${err.message}`);
      }
    }

    // Optional: Mark older jobs for this company not present in the new feed as inactive
    let deactivated = 0;
    if (syncDeactivations && activeExternalIds.length > 0) {
      const deactivationResult = await this.jobModel.updateMany(
        {
          externalId: { $regex: `^GH-${boardToken}-`, $nin: activeExternalIds },
          isActive: true,
        },
        { $set: { isActive: false } },
      );
      deactivated = deactivationResult.modifiedCount || 0;
    }

    return {
      company: companyName,
      boardToken,
      totalFound: raw.jobs.length,
      imported,
      updated,
      deactivated,
      skipped,
      errors: errors.slice(0, 5),
      jobs: savedJobs.slice(0, 10),
    };
  }

  /**
   * Batch scrapes all companies in the registry
   */
  async scrapeAllCompanies(
    options: {
      indiaOnly?: boolean;
      limit?: number;
      syncDeactivations?: boolean;
    } = {},
  ): Promise<BatchScrapeResult> {
    const indiaOnly = options.indiaOnly !== false; // defaults to true
    const results: ScrapeResult[] = [];
    const errors: Array<{ company: string; boardToken: string; error: string }> = [];

    let totalFound = 0;
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let successfulCompanies = 0;

    this.logger.log(
      `Starting batch scrape across ${this.PRESET_COMPANIES.length} companies (India & Remote Only: ${indiaOnly})...`,
    );

    for (const company of this.PRESET_COMPANIES) {
      try {
        this.logger.log(`[Greenhouse] Scraping ${company.name} (${company.token})...`);
        const result = await this.importJobs({
          boardToken: company.token,
          companyName: company.name,
          companyLogo: company.logo,
          categoryOverride: company.category,
          limit: options.limit,
          syncDeactivations: options.syncDeactivations ?? true,
          indiaOnly,
        });

        results.push(result);
        totalFound += result.totalFound;
        totalImported += result.imported;
        totalUpdated += result.updated;
        totalSkipped += result.skipped;
        successfulCompanies++;

        this.logger.log(
          `[Greenhouse] Completed ${company.name}: +${result.imported} imported, ${result.updated} updated, ${result.skipped} filtered/skipped (Total on board: ${result.totalFound})`,
        );
      } catch (err: any) {
        this.logger.error(`[Greenhouse] Failed ${company.name} (${company.token}): ${err.message}`);
        errors.push({
          company: company.name,
          boardToken: company.token,
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
   * Normalizes raw Greenhouse job into Applyra Job Schema
   */
  public normalizeJob(
    rawJob: GreenhouseJobResponse['jobs'][0],
    options: {
      boardToken: string;
      companyName: string;
      companyLogo?: string;
      categoryOverride?: string;
    },
  ): any {
    const rawContent = this.decodeHtmlEntities(rawJob.content || '');
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

    let locationName = rawJob.location?.name?.trim() || '';
    const officeNames = (rawJob.offices || [])
      .map((o) => o.name || o.location)
      .filter(Boolean)
      .join(', ');

    if (!locationName || ['in-office', 'hybrid', 'distributed', 'remote', ''].includes(locationName.toLowerCase())) {
      if (officeNames) {
        locationName = officeNames;
      }
    }
    locationName = locationName || 'Remote';
    const workMode = this.detectWorkMode(rawJob.title, locationName, plainDescription);
    const jobType = this.detectJobType(rawJob.title, plainDescription);

    const departmentName = rawJob.departments?.[0]?.name || '';
    const category = options.categoryOverride || this.detectCategory(rawJob.title, departmentName);

    const salary = this.extractSalary(rawContent, plainDescription);
    const experience = this.extractExperience(plainDescription);
    const skills = extractSkillsFromText(`${rawJob.title} ${plainDescription}`);

    const externalId = `GH-${options.boardToken}-${rawJob.id}`;
    const slug = this.generateSlug(rawJob.title, options.companyName, rawJob.id.toString());

    return {
      title: rawJob.title.trim(),
      slug,
      company: options.companyName,
      companyId: '',
      companyLogo: options.companyLogo || '',
      description: plainDescription || `${rawJob.title} at ${options.companyName}`,
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
      source: 'Company Careers',
      originalUrl: rawJob.absolute_url,
      externalId,
      availableOnSources: ['Company Careers', 'Greenhouse'],
      postedAt: rawJob.updated_at ? new Date(rawJob.updated_at) : new Date(),
      isActive: true,
    };
  }

  // --- Normalization Helpers ---

  /**
   * Generates a clean URL slug
   */
  private generateSlug(title: string, company: string, jobId: string): string {
    const raw = `${title}-${company}-${jobId}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    return raw.slice(0, 100);
  }

  /**
   * Decodes HTML entities commonly returned by Greenhouse
   */
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

  /**
   * Converts HTML to clean readable plain text
   */
  private extractPlainText(html: string): string {
    if (!html) return '';
    return html
      .replace(/<\/?(h[1-6]|p|div|br|li|ul|ol|table|tr)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();
  }

  /**
   * Extracts list items (bullets) under specific section headers
   */
  private extractSectionBullets(html: string, sectionKeywords: string[]): string[] {
    const bullets: string[] = [];
    if (!html) return bullets;

    const sections = html.split(/(?:<h[1-6][^>]*>|<strong>|<b\b)/i);

    for (const section of sections) {
      const headerMatch = section.match(/^([^<]{2,80})/i);
      if (!headerMatch) continue;

      const headerText = headerMatch[1].toLowerCase();
      const isTargetSection = sectionKeywords.some((kw) => headerText.includes(kw.toLowerCase()));

      if (isTargetSection) {
        const liMatches = section.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
        for (const match of liMatches) {
          const text = this.extractPlainText(match[1])
            .replace(/^[\s•\-*–—]+/, '')
            .trim();
          if (text.length > 8 && text.length < 350) {
            bullets.push(text);
          }
        }
      }
    }

    return bullets.slice(0, 8);
  }

  /**
   * Detects workMode enum ('Remote' | 'Hybrid' | 'On-site')
   */
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

  /**
   * Detects jobType enum ('Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Apprenticeship')
   */
  private detectJobType(title: string, description: string): string {
    const combined = `${title} ${description.slice(0, 800)}`.toLowerCase();

    if (
      combined.includes('intern') ||
      combined.includes('internship') ||
      combined.includes('summer')
    ) {
      return 'Internship';
    }

    if (
      combined.includes('contract') ||
      combined.includes('freelance') ||
      combined.includes('temporary')
    ) {
      return 'Contract';
    }

    if (combined.includes('part-time') || combined.includes('part time')) {
      return 'Part-time';
    }

    if (combined.includes('apprentice') || combined.includes('apprenticeship')) {
      return 'Apprenticeship';
    }

    return 'Full-time';
  }

  /**
   * Maps title and department to Applyra's categories
   */
  private detectCategory(title: string, department: string): string {
    const text = `${title} ${department}`.toLowerCase();

    if (
      text.includes('qa') ||
      text.includes('quality') ||
      text.includes('testing') ||
      text.includes('sdet')
    ) {
      return 'QA/Testing';
    }
    if (
      text.includes('machine learning') ||
      text.includes('ai') ||
      text.includes('artificial intelligence') ||
      text.includes('deep learning') ||
      text.includes('nlp')
    ) {
      return 'AI/ML';
    }
    if (text.includes('data') || text.includes('analytics') || text.includes('bi analyst')) {
      return 'Data';
    }
    if (
      text.includes('devops') ||
      text.includes('cloud') ||
      text.includes('infrastructure') ||
      text.includes('sre') ||
      text.includes('platform engineer') ||
      text.includes('site reliability')
    ) {
      return 'DevOps/Cloud';
    }
    if (
      text.includes('security') ||
      text.includes('cyber') ||
      text.includes('infosec') ||
      text.includes('appsec')
    ) {
      return 'Cybersecurity';
    }
    if (
      text.includes('support') ||
      text.includes('helpdesk') ||
      text.includes('it analyst') ||
      text.includes('system admin')
    ) {
      return 'IT Support';
    }
    if (text.includes('intern') || text.includes('co-op')) {
      return 'Internships';
    }
    if (
      text.includes('sales') ||
      text.includes('account executive') ||
      text.includes('business development') ||
      text.includes('bdr') ||
      text.includes('sdr')
    ) {
      return 'Sales';
    }
    if (
      text.includes('marketing') ||
      text.includes('growth') ||
      text.includes('seo') ||
      text.includes('content')
    ) {
      return 'Marketing';
    }
    if (
      text.includes('finance') ||
      text.includes('accounting') ||
      text.includes('tax') ||
      text.includes('audit')
    ) {
      return 'Finance';
    }
    if (
      text.includes('hr') ||
      text.includes('people') ||
      text.includes('recruiting') ||
      text.includes('talent')
    ) {
      return 'HR';
    }
    if (
      text.includes('operations') ||
      text.includes('bizops') ||
      text.includes('program manager')
    ) {
      return 'Operations';
    }
    if (
      text.includes('engineer') ||
      text.includes('developer') ||
      text.includes('software') ||
      text.includes('frontend') ||
      text.includes('backend') ||
      text.includes('fullstack') ||
      text.includes('architect') ||
      text.includes('web')
    ) {
      return 'Software';
    }

    return 'Other';
  }

  /**
   * Attempts to parse salary ranges from HTML or text
   */
  private extractSalary(html: string, text: string): string {
    const usdPattern =
      /\$[0-9]{2,3}(?:,[0-9]{3})*(?:\s*[-—to]+\s*\$[0-9]{2,3}(?:,[0-9]{3})*)?(?:\s*(?:USD|annually|per year))?/i;
    const usdMatch = html.match(usdPattern) || text.match(usdPattern);
    if (usdMatch) {
      return usdMatch[0].trim();
    }

    const inrPattern =
      /(?:₹\s*)?[0-9]{1,2}(?:\.[0-9]+)?\s*[-–to]+\s*(?:₹\s*)?[0-9]{1,2}(?:\.[0-9]+)?\s*LPA/i;
    const inrMatch = text.match(inrPattern);
    if (inrMatch) {
      return inrMatch[0].trim();
    }

    return 'Not disclosed';
  }

  /**
   * Attempts to parse experience requirements like "2-4 years"
   */
  private extractExperience(text: string): string {
    const expPattern =
      /([0-9]{1,2})\s*(?:[-–to]+)\s*([0-9]{1,2})\s*(?:\+)?\s*years?(?:\s*of\s*experience)?/i;
    const match = text.match(expPattern);
    if (match) {
      return `${match[1]}-${match[2]} years`;
    }

    const minExpPattern = /([0-9]{1,2})\+\s*years?(?:\s*of\s*experience)?/i;
    const minMatch = text.match(minExpPattern);
    if (minMatch) {
      return `${minMatch[1]}+ years`;
    }

    return '1-3 years';
  }
}
