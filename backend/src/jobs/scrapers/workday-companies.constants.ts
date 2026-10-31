import { WorkdayCompanyPreset, WorkdaySiteConfig } from './scraper.types';

export const WORKDAY_COMPANIES_REGISTRY: WorkdayCompanyPreset[] = [
  {
    name: 'Adobe',
    tenant: 'adobe',
    host: 'wd5',
    site: 'external_experienced',
    url: 'https://adobe.wd5.myworkdayjobs.com/external_experienced',
    category: 'Software',
    logo: 'https://cdn.worldvectorlogo.com/logos/adobe-2.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'NVIDIA',
    tenant: 'nvidia',
    host: 'wd5',
    site: 'NVIDIAExternalCareerSite',
    url: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite',
    category: 'AI/ML',
    logo: 'https://cdn.worldvectorlogo.com/logos/nvidia.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'Salesforce',
    tenant: 'salesforce',
    host: 'wd12',
    site: 'External_Career_Site',
    url: 'https://salesforce.wd12.myworkdayjobs.com/External_Career_Site',
    category: 'Software',
    logo: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'Target',
    tenant: 'target',
    host: 'wd5',
    site: 'targetcareers',
    url: 'https://target.wd5.myworkdayjobs.com/targetcareers',
    category: 'Software',
    logo: 'https://cdn.worldvectorlogo.com/logos/target-7.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'Mastercard',
    tenant: 'mastercard',
    host: 'wd1',
    site: 'CorporateCareers',
    url: 'https://mastercard.wd1.myworkdayjobs.com/CorporateCareers',
    category: 'Finance',
    logo: 'https://cdn.worldvectorlogo.com/logos/mastercard-2.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'Intel',
    tenant: 'intel',
    host: 'wd1',
    site: 'External',
    url: 'https://intel.wd1.myworkdayjobs.com/External',
    category: 'Software',
    logo: 'https://cdn.worldvectorlogo.com/logos/intel.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'HP',
    tenant: 'hp',
    host: 'wd5',
    site: 'ExternalCareerSite',
    url: 'https://hp.wd5.myworkdayjobs.com/ExternalCareerSite',
    category: 'Software',
    logo: 'https://cdn.worldvectorlogo.com/logos/hp-2.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'Philips',
    tenant: 'philips',
    host: 'wd3',
    site: 'jobs-and-careers',
    url: 'https://philips.wd3.myworkdayjobs.com/jobs-and-careers',
    category: 'Software',
    logo: 'https://cdn.worldvectorlogo.com/logos/philips-2.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'Motorola Solutions',
    tenant: 'motorolasolutions',
    host: 'wd5',
    site: 'Careers',
    url: 'https://motorolasolutions.wd5.myworkdayjobs.com/Careers',
    category: 'DevOps/Cloud',
    logo: 'https://cdn.worldvectorlogo.com/logos/motorola-solutions.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'CrowdStrike',
    tenant: 'crowdstrike',
    host: 'wd5',
    site: 'crowdstrikecareers',
    url: 'https://crowdstrike.wd5.myworkdayjobs.com/crowdstrikecareers',
    category: 'Cybersecurity',
    logo: '',
    hasIndiaPresence: true,
  },
  {
    name: 'PayPal',
    tenant: 'paypal',
    host: 'wd1',
    site: 'jobs',
    url: 'https://paypal.wd1.myworkdayjobs.com/jobs',
    category: 'Finance',
    logo: 'https://cdn.worldvectorlogo.com/logos/paypal-3.svg',
    hasIndiaPresence: true,
  },
  {
    name: 'Broadcom',
    tenant: 'broadcom',
    host: 'wd1',
    site: 'External_Career',
    url: 'https://broadcom.wd1.myworkdayjobs.com/External_Career',
    category: 'DevOps/Cloud',
    logo: '',
    hasIndiaPresence: true,
  },
  {
    name: 'Autodesk',
    tenant: 'autodesk',
    host: 'wd1',
    site: 'Ext',
    url: 'https://autodesk.wd1.myworkdayjobs.com/Ext',
    category: 'Software',
    logo: 'https://cdn.worldvectorlogo.com/logos/autodesk.svg',
    hasIndiaPresence: true,
  },
];

/**
 * Parses user input (URL, preset token, or path) into tenant, host, and site components.
 * Examples supported:
 * - 'adobe' or 'Nvidia' (matches presets)
 * - 'https://adobe.wd5.myworkdayjobs.com/external_experienced'
 * - 'https://salesforce.wd12.myworkdayjobs.com/en-US/External_Career_Site'
 * - 'https://adobe.wd5.myworkdayjobs.com/external_experienced/job/Remote-India/Customer_R123'
 * - 'hp.wd5.myworkdayjobs.com/ExternalCareerSite'
 * - 'target/wd5/targetcareers'
 */
export function parseWorkdayInput(input: string): WorkdaySiteConfig | null {
  if (!input) return null;
  const clean = input.trim();

  // 1. Check against known presets by tenant or company name
  const matched = WORKDAY_COMPANIES_REGISTRY.find(
    (p) =>
      p.tenant.toLowerCase() === clean.toLowerCase() ||
      p.name.toLowerCase() === clean.toLowerCase(),
  );
  if (matched) {
    return {
      tenant: matched.tenant,
      host: matched.host,
      site: matched.site,
    };
  }

  // 2. Full or partial Workday career URL match
  // e.g. https://adobe.wd5.myworkdayjobs.com/[en-US/]external_experienced[/job/...]
  const urlMatch = clean.match(
    /(?:https?:\/\/)?([a-zA-Z0-9_\-]+)\.(wd[0-9]+)\.myworkdayjobs\.com\/(?:[a-zA-Z]{2}(?:-[a-zA-Z]{2})?\/)?([a-zA-Z0-9_\-]+)/i,
  );
  if (urlMatch) {
    return {
      tenant: urlMatch[1].toLowerCase(),
      host: urlMatch[2].toLowerCase(),
      site: urlMatch[3],
    };
  }

  // 3. Format: tenant/host/site (e.g. hp/wd5/ExternalCareerSite)
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 3) {
    return {
      tenant: parts[0].toLowerCase(),
      host: parts[1].toLowerCase(),
      site: parts[2],
    };
  }

  return null;
}

/**
 * Parses relative Workday posted strings into actual JavaScript Dates.
 * e.g. "Posted Today" -> Date.now()
 *      "Posted Yesterday" -> 1 day ago
 *      "Posted 5 Days Ago" -> 5 days ago
 *      "Posted 30+ Days Ago" -> 30 days ago
 */
export function parseWorkdayPostedDate(postedOn?: string): Date {
  if (!postedOn) return new Date();
  const lower = postedOn.toLowerCase();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  if (lower.includes('today')) {
    return new Date(now);
  }
  if (lower.includes('yesterday')) {
    return new Date(now - ONE_DAY);
  }

  const daysMatch = lower.match(/posted\s+(\d+)\+?\s+days?\s+ago/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return new Date(now - days * ONE_DAY);
  }

  return new Date();
}

