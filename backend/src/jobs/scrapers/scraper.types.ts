export interface GreenhouseJobResponse {
  jobs: Array<{
    id: number;
    internal_job_id: number;
    title: string;
    updated_at: string;
    requisition_id?: string;
    absolute_url: string;
    location?: {
      name: string;
    };
    content?: string;
    departments?: Array<{
      id: number;
      name: string;
    }>;
    offices?: Array<{
      id: number;
      name: string;
      location?: string;
    }>;
    company_name?: string;
  }>;
  meta?: {
    total: number;
  };
}

export interface GreenhouseBoardInfo {
  name: string;
  content?: string;
}

export interface ScrapeImportOptions {
  boardToken: string;
  companyName?: string;
  companyLogo?: string;
  limit?: number;
  categoryOverride?: string;
  syncDeactivations?: boolean;
  indiaOnly?: boolean;
}

export interface ScrapeResult {
  company: string;
  boardToken: string;
  totalFound: number;
  imported: number;
  updated: number;
  deactivated: number;
  skipped: number;
  errors: string[];
  jobs: any[];
}

export interface BatchScrapeResult {
  totalCompanies: number;
  successfulCompanies: number;
  failedCompanies: number;
  totalFound: number;
  totalImported: number;
  totalUpdated: number;
  totalSkipped: number;
  results: ScrapeResult[];
  errors: Array<{ company: string; boardToken: string; error: string }>;
}

// ==========================================
// Workday Scraper Types
// ==========================================

export interface WorkdaySiteConfig {
  tenant: string;
  host: string; // e.g. 'wd5', 'wd1', 'wd12'
  site: string; // e.g. 'external_experienced'
}

export interface WorkdayJobListItem {
  title: string;
  externalPath: string;
  locationsText?: string;
  postedOn?: string;
  bulletFields?: string[];
  subtitles?: string[];
}

export interface WorkdayJobsResponse {
  total: number;
  jobPostings?: WorkdayJobListItem[];
}

export interface WorkdayJobDetailInfo {
  id?: string;
  title: string;
  jobDescription?: string;
  location?: string;
  secondaryLocations?: string[];
  additionalLocations?: string[];
  timeType?: string;
  jobReqId?: string;
  postedOn?: string;
  startDate?: string;
  externalUrl?: string;
  country?: { descriptor?: string; id?: string };
  jobRequisitionLocation?: { descriptor?: string };
}

export interface WorkdayJobDetailResponse {
  jobPostingInfo?: WorkdayJobDetailInfo;
  hiringOrganization?: string;
}

export interface WorkdayCompanyPreset {
  name: string;
  tenant: string;
  host: string;
  site: string;
  url: string;
  category: string;
  logo: string;
  hasIndiaPresence: boolean;
}

export interface WorkdayScrapeImportOptions {
  siteUrlOrToken: string; // URL e.g. https://adobe.wd5.myworkdayjobs.com/external_experienced or preset tenant
  companyName?: string;
  companyLogo?: string;
  limit?: number;
  categoryOverride?: string;
  syncDeactivations?: boolean;
  indiaOnly?: boolean;
}
