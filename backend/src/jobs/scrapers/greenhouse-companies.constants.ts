export interface GreenhouseCompanyPreset {
  name: string;
  token: string;
  logo: string;
  category: string;
  hasIndiaPresence: boolean;
}

export const GREENHOUSE_COMPANIES_REGISTRY: GreenhouseCompanyPreset[] = [
  // Top tech companies & MNCs with verified India development centers
  {
    name: 'InMobi',
    token: 'inmobi',
    logo: '',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Groww',
    token: 'groww',
    logo: '',
    category: 'Finance',
    hasIndiaPresence: true,
  },
  {
    name: 'Databricks',
    token: 'databricks',
    logo: 'https://cdn.worldvectorlogo.com/logos/databricks.svg',
    category: 'Data',
    hasIndiaPresence: true,
  },
  {
    name: 'MongoDB',
    token: 'mongodb',
    logo: 'https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg',
    category: 'Data',
    hasIndiaPresence: true,
  },
  {
    name: 'Okta',
    token: 'okta',
    logo: 'https://cdn.worldvectorlogo.com/logos/okta.svg',
    category: 'Cybersecurity',
    hasIndiaPresence: true,
  },
  {
    name: 'Zscaler',
    token: 'zscaler',
    logo: 'https://cdn.worldvectorlogo.com/logos/zscaler.svg',
    category: 'Cybersecurity',
    hasIndiaPresence: true,
  },
  {
    name: 'Stripe',
    token: 'stripe',
    logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
    category: 'Finance',
    hasIndiaPresence: true,
  },
  {
    name: 'Rubrik',
    token: 'rubrik',
    logo: '',
    category: 'DevOps/Cloud',
    hasIndiaPresence: true,
  },
  {
    name: 'Elastic',
    token: 'elastic',
    logo: 'https://cdn.worldvectorlogo.com/logos/elasticsearch.svg',
    category: 'Data',
    hasIndiaPresence: true,
  },
  {
    name: 'Twilio',
    token: 'twilio',
    logo: 'https://cdn.worldvectorlogo.com/logos/twilio.svg',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Toast',
    token: 'toast',
    logo: '',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Netskope',
    token: 'netskope',
    logo: '',
    category: 'Cybersecurity',
    hasIndiaPresence: true,
  },
  {
    name: 'Roblox',
    token: 'roblox',
    logo: 'https://cdn.worldvectorlogo.com/logos/roblox.svg',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Datadog',
    token: 'datadog',
    logo: 'https://cdn.worldvectorlogo.com/logos/datadog.svg',
    category: 'DevOps/Cloud',
    hasIndiaPresence: true,
  },
  {
    name: 'Coinbase',
    token: 'coinbase',
    logo: 'https://cdn.worldvectorlogo.com/logos/coinbase-1.svg',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Airbnb',
    token: 'airbnb',
    logo: 'https://cdn.worldvectorlogo.com/logos/airbnb.svg',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Deliveroo',
    token: 'deliveroo',
    logo: 'https://cdn.worldvectorlogo.com/logos/deliveroo-logo.svg',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Coursera',
    token: 'coursera',
    logo: 'https://cdn.worldvectorlogo.com/logos/coursera.svg',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Samsara',
    token: 'samsara',
    logo: '',
    category: 'DevOps/Cloud',
    hasIndiaPresence: true,
  },
  {
    name: 'Cloudflare',
    token: 'cloudflare',
    logo: 'https://cdn.worldvectorlogo.com/logos/cloudflare-1.svg',
    category: 'DevOps/Cloud',
    hasIndiaPresence: true,
  },
  {
    name: 'LaunchDarkly',
    token: 'launchdarkly',
    logo: '',
    category: 'DevOps/Cloud',
    hasIndiaPresence: true,
  },
  {
    name: 'Starburst',
    token: 'starburst',
    logo: '',
    category: 'Data',
    hasIndiaPresence: true,
  },
  {
    name: 'Roku',
    token: 'roku',
    logo: '',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Yugabyte',
    token: 'yugabyte',
    logo: '',
    category: 'Data',
    hasIndiaPresence: true,
  },
  {
    name: 'Figma',
    token: 'figma',
    logo: 'https://cdn.worldvectorlogo.com/logos/figma-5.svg',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'Cockroach Labs',
    token: 'cockroachlabs',
    logo: '',
    category: 'Data',
    hasIndiaPresence: true,
  },
  {
    name: 'Fastly',
    token: 'fastly',
    logo: '',
    category: 'DevOps/Cloud',
    hasIndiaPresence: true,
  },
  {
    name: 'Scale AI',
    token: 'scaleai',
    logo: '',
    category: 'AI/ML',
    hasIndiaPresence: true,
  },
  {
    name: 'Vercel',
    token: 'vercel',
    logo: 'https://cdn.worldvectorlogo.com/logos/vercel.svg',
    category: 'Software',
    hasIndiaPresence: true,
  },
  {
    name: 'GitLab',
    token: 'gitlab',
    logo: 'https://cdn.worldvectorlogo.com/logos/gitlab.svg',
    category: 'DevOps/Cloud',
    hasIndiaPresence: true,
  },
  {
    name: 'Canonical',
    token: 'canonical',
    logo: 'https://cdn.worldvectorlogo.com/logos/canonical.svg',
    category: 'DevOps/Cloud',
    hasIndiaPresence: true,
  },
];

/**
 * Strict evaluation of whether a job is located in India OR is genuinely
 * worldwide / global remote (eligible for Indian candidates).
 *
 * Strictly rejects:
 * - Foreign physical locations (US, UK, Europe, Australia, Canada, etc.)
 * - Region-locked remote jobs (Remote US, Remote West Coast, Remote EMEA, Remote Americas, etc.)
 */
export function isIndiaOrRemote(
  location: string = '',
  title: string = '',
  description: string = '',
  offices: Array<{ name?: string; location?: string }> = [],
): boolean {
  const loc = (location || '').toLowerCase();
  const t = (title || '').toLowerCase();
  const desc = (description || '').slice(0, 2000).toLowerCase();

  const officeStr = offices
    .map((o) => `${o.name || ''} ${o.location || ''}`.toLowerCase())
    .join(' ');

  // =========================================================================
  // 1. Direct Indian locations, states, and major tech hubs (INSTANT APPROVAL)
  // =========================================================================
  const indiaKeywords = [
    'india',
    'bengaluru',
    'bangalore',
    'hyderabad',
    'pune',
    'mumbai',
    'gurugram',
    'gurgaon',
    'noida',
    'delhi',
    'new delhi',
    'ncr',
    'chennai',
    'kolkata',
    'ahmedabad',
    'kochi',
    'cochin',
    'chandigarh',
    'mohali',
    'coimbatore',
    'indore',
    'jaipur',
    'thiruvananthapuram',
    'trivandrum',
    'bhubaneswar',
    'nagpur',
    'visakhapatnam',
    'vizag',
    'vadodara',
    'mysuru',
    'mysore',
    'karnataka',
    'telangana',
    'maharashtra',
    'tamil nadu',
    'haryana',
    'uttar pradesh',
    'kerala',
    'west bengal',
    'gujarat',
  ];

  const hasIndiaKeyword = indiaKeywords.some((kw) => {
    const reg = new RegExp(`(^|[^a-z])${kw}([^a-z]|$)`, 'i');
    return reg.test(loc) || reg.test(officeStr) || reg.test(t);
  });

  if (hasIndiaKeyword) {
    return true;
  }

  // =========================================================================
  // 2. Foreign Geography Signals (DISQUALIFIERS)
  // If the job mentions ANY foreign country, foreign region, US city/state,
  // without mentioning India, it is strictly NOT an India role!
  // =========================================================================
  const foreignGeography = [
    // Countries
    'united states', 'usa', 'u.s.', 'u.s', 'canada', 'mexico', 'brazil',
    'argentina', 'colombia', 'chile', 'costa rica', 'united kingdom', 'uk',
    'u.k.', 'ireland', 'germany', 'france', 'spain', 'italy', 'netherlands',
    'poland', 'sweden', 'norway', 'finland', 'denmark', 'switzerland',
    'austria', 'belgium', 'portugal', 'czech', 'romania', 'hungary',
    'greece', 'turkey', 'israel', 'australia', 'new zealand', 'singapore',
    'japan', 'south korea', 'taiwan', 'philippines', 'indonesia',
    'vietnam', 'thailand', 'malaysia', 'south africa', 'nigeria', 'kenya',
    'egypt', 'uae', 'dubai', 'china',
    // Regions & Timezones
    'emea', 'latam', 'americas', 'north america', 'europe', 'latin america',
    'west coast', 'east coast', 'midwest', 'pacific', 'mountain time',
    // Major US/Global Cities & Metro Areas
    'san francisco', 'bay area', 'los angeles', 'seattle', 'new york', 'nyc',
    'austin', 'chicago', 'boston', 'denver', 'atlanta', 'san diego',
    'dallas', 'portland', 'miami', 'toronto', 'vancouver', 'montreal',
    'london', 'dublin', 'berlin', 'paris', 'amsterdam', 'madrid', 'barcelona',
    'lisbon', 'tokyo', 'sydney', 'melbourne', 'beijing', 'shanghai',
    // US State Names
    'california', 'texas', 'washington', 'colorado', 'illinois',
    'massachusetts', 'florida', 'virginia', 'pennsylvania', 'ohio',
    'michigan', 'arizona', 'oregon', 'utah', 'new jersey', 'georgia',
    'north carolina',
  ];

  const hasForeignSignal = foreignGeography.some((fg) => {
    const reg = new RegExp(`(^|[^a-z])${fg.replace('.', '\\.')}([^a-z]|$)`, 'i');
    return reg.test(loc) || reg.test(officeStr);
  });

  if (hasForeignSignal) {
    return false;
  }

  // Check 2-letter US state or country abbreviations like 'CA', 'NY', 'TX', 'US', etc.
  const stateAbbrRegex = /\b(us|usa|ca|ny|tx|wa|il|ma|fl|nc|ga|va|pa|co|az|or|ut|uk)\b/i;
  if (stateAbbrRegex.test(loc) || stateAbbrRegex.test(officeStr)) {
    return false;
  }

  // Check description for foreign-only restriction phrases
  const foreignDescRestrictions = [
    'us only',
    'u.s. only',
    'united states only',
    'eligible to work in the us',
    'eligible to work in the u.s.',
    'authorized to work in the us',
    'authorized to work in the united states',
    'reside in the us',
    'reside in the united states',
    'located in the us',
    'canada only',
    'uk only',
    'europe only',
  ];
  if (foreignDescRestrictions.some((fdr) => desc.includes(fdr))) {
    return false;
  }

  // =========================================================================
  // 3. Worldwide / Global Remote (Only if NO foreign restriction above matched)
  // =========================================================================
  const isWorldwideRemote =
    loc.includes('worldwide') ||
    loc.includes('global') ||
    loc.includes('anywhere in the world') ||
    loc.includes('work from anywhere') ||
    loc.includes('remote - apac') ||
    loc.includes('home based - worldwide') ||
    (loc === 'remote' && !officeStr && !hasForeignSignal);

  return isWorldwideRemote;
}
