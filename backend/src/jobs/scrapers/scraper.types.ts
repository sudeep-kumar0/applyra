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
