export const TECH_SKILLS: string[] = [
  // Programming Languages
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Golang',
  'Rust',
  'C++',
  'C#',
  'Ruby',
  'PHP',
  'Kotlin',
  'Swift',
  'SQL',
  'HTML',
  'CSS',
  'Bash',
  'Shell',

  // Frontend Frameworks & Libraries
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Svelte',
  'Tailwind CSS',
  'Redux',
  'Zustand',
  'GraphQL',
  'Webpack',
  'Vite',

  // Backend Frameworks
  'Node.js',
  'NestJS',
  'Express',
  'Spring Boot',
  'Django',
  'FastAPI',
  'Flask',
  'Ruby on Rails',
  'ASP.NET',
  'Laravel',

  // Databases & Caches
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'DynamoDB',
  'Cassandra',
  'Supabase',
  'Firebase',
  'Snowflake',
  'BigQuery',

  // Cloud & DevOps
  'AWS',
  'GCP',
  'Google Cloud',
  'Azure',
  'Docker',
  'Kubernetes',
  'Terraform',
  'CI/CD',
  'GitHub Actions',
  'GitLab CI',
  'Linux',
  'Kafka',
  'RabbitMQ',
  'Prometheus',
  'Grafana',

  // AI / ML / Data
  'PyTorch',
  'TensorFlow',
  'Machine Learning',
  'Deep Learning',
  'LLM',
  'NLP',
  'Computer Vision',
  'Pandas',
  'NumPy',
  'Scikit-learn',
  'Spark',

  // Concepts & Architecture
  'REST API',
  'Microservices',
  'Distributed Systems',
  'System Design',
  'Unit Testing',
  'Agile',
  'Scrum',
  'Git',
];

/**
 * Extracts skills by checking word boundaries against text
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();

  for (const skill of TECH_SKILLS) {
    // Escape special chars for regex like C++
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;:.()/\\[\\]{}"'-])${escaped}(?:[\\s,;:.()/\\[\\]{}"'-]|$)`, 'i');
    if (regex.test(text)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

