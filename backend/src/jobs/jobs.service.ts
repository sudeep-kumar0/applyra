import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async onModuleInit() {
    await this.seedInitialJobs();
  }

  async seedInitialJobs() {
    try {
      const count = await this.jobModel.countDocuments();
      if (count === 0) {
        this.logger.log('Initializing realistic development seed jobs...');
        const seedJobs: Partial<Job>[] = [
          {
            title: 'Java Full Stack Developer',
            slug: 'java-full-stack-developer-tcs-bengaluru',
            company: 'Tata Consultancy Services',
            description:
              'We are seeking a talented Java Full Stack Developer to build enterprise banking solutions. You will work with modern Spring Boot microservices, Angular/React interfaces, and cloud-native architectures.',
            responsibilities: [
              'Design and develop high-scale microservices using Java 17 and Spring Boot',
              'Build responsive frontend components using React and TypeScript',
              'Collaborate with product and cross-functional engineering squads',
              'Write unit, integration, and contract tests with JUnit and Mockito',
              'Participate in agile sprints, code reviews, and CI/CD automation',
            ],
            skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'REST API'],
            preferredSkills: ['Kafka', 'Kubernetes', 'AWS', 'Redis'],
            qualifications: [
              "Bachelor's degree in Computer Science, Information Technology, or equivalent",
              'Hands-on experience with Java and modern JavaScript frameworks',
            ],
            location: 'Bengaluru, Karnataka',
            salary: '₹6–10 LPA',
            experience: '1-3 years',
            workMode: 'Hybrid',
            jobType: 'Full-time',
            category: 'Java Developer',
            source: 'Company Careers',
            originalUrl: 'https://careers.tcs.com/jobs/java-fullstack-dev-blr',
            externalId: 'TCS-DEV-2026-081',
            availableOnSources: ['Company Careers', 'LinkedIn', 'Naukri'],
            postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            isActive: true,
          },
          {
            title: 'Frontend React Developer',
            slug: 'frontend-react-developer-swiggy-bengaluru',
            company: 'Swiggy',
            description:
              'Join Swiggy Consumer Engineering team to create ultra-fast, delightful web experiences for millions of daily active users ordering food and groceries.',
            responsibilities: [
              'Develop state-of-the-art web applications with Next.js, React, and Tailwind CSS',
              'Optimize client-side performance, Core Web Vitals, and bundle sizes',
              'Integrate complex REST and GraphQL endpoints with seamless caching',
              'Partner closely with UI/UX designers to translate Figma into pixel-perfect code',
            ],
            skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'JavaScript'],
            preferredSkills: ['GraphQL', 'Web Performance', 'Cypress', 'PWA'],
            qualifications: [
              'Strong mastery of modern JavaScript/TypeScript and React ecosystem',
              'Proven track record of building performant web applications',
            ],
            location: 'Bengaluru, Karnataka (Remote Available)',
            salary: '₹12–18 LPA',
            experience: '2-4 years',
            workMode: 'Remote',
            jobType: 'Full-time',
            category: 'Frontend Developer',
            source: 'Company Careers',
            originalUrl: 'https://careers.swiggy.com/jobs/frontend-engineer-react',
            externalId: 'SWG-FE-884',
            availableOnSources: ['Company Careers', 'LinkedIn'],
            postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            isActive: true,
          },
          {
            title: 'Backend Node.js Engineer',
            slug: 'backend-nodejs-engineer-razorpay-bengaluru',
            company: 'Razorpay',
            description:
              'Scale Razorpay payment gateway infrastructure. Design low-latency financial systems handling billions of transactions per month with 99.999% uptime.',
            responsibilities: [
              'Architect, build, and maintain mission-critical payment APIs using Node.js and NestJS',
              'Design resilient database schemas in PostgreSQL and MongoDB Atlas',
              'Implement high-throughput event processing pipelines with Apache Kafka',
              'Ensure strict security compliance and PCI-DSS requirements',
            ],
            skills: ['Node.js', 'NestJS', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker'],
            preferredSkills: ['Kafka', 'AWS', 'Microservices', 'Distributed Systems'],
            qualifications: [
              'Solid understanding of asynchronous programming, concurrency, and distributed systems',
              'Experience in API security, rate limiting, and authentication protocols',
            ],
            location: 'Bengaluru, Karnataka',
            salary: '₹14–22 LPA',
            experience: '2-5 years',
            workMode: 'Hybrid',
            jobType: 'Full-time',
            category: 'Backend Developer',
            source: 'Company Careers',
            originalUrl: 'https://razorpay.com/jobs/backend-engineer-node',
            externalId: 'RZP-BE-341',
            availableOnSources: ['Company Careers', 'Indeed', 'Foundit'],
            postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            isActive: true,
          },
          {
            title: 'Software Development Engineer - I (Full Stack)',
            slug: 'sde-1-full-stack-amazon-hyderabad',
            company: 'Amazon',
            description:
              'Amazon is seeking a Software Development Engineer I to join our Cloud Logistics engineering org. You will solve real-world logistical challenges using cutting-edge cloud infrastructure.',
            responsibilities: [
              'Develop end-to-end software modules across distributed architectures',
              'Participate in design reviews, operational excellence metrics, and automated testing',
              'Build robust APIs and responsive internal administration tools',
            ],
            skills: ['Java', 'Python', 'AWS', 'React', 'SQL', 'Algorithms', 'Data Structures'],
            preferredSkills: ['DynamoDB', 'Lambda', 'CDK', 'CI/CD'],
            qualifications: [
              "Bachelor's degree in Computer Science or related STEM field",
              'Solid grasp of object-oriented design and algorithm optimization',
            ],
            location: 'Hyderabad, Telangana',
            salary: '₹16–24 LPA',
            experience: '0-2 years',
            workMode: 'On-site',
            jobType: 'Full-time',
            category: 'Software Engineer',
            source: 'Company Careers',
            originalUrl: 'https://amazon.jobs/en/jobs/sde1-hyd-fullstack',
            externalId: 'AMZN-HYD-5021',
            availableOnSources: ['Company Careers', 'LinkedIn'],
            postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            isActive: true,
          },
          {
            title: 'QA Automation Engineer',
            slug: 'qa-automation-engineer-wipro-pune',
            company: 'Wipro Technologies',
            description:
              'Looking for an enthusiastic QA Automation Engineer to drive quality assurance and test automation for our global fintech clients.',
            responsibilities: [
              'Develop automated regression test suites using Selenium WebDriver and Cypress',
              'Execute automated API testing with RestAssured and Postman',
              'Integrate automated tests into Jenkins CI/CD deployment pipelines',
              'Identify, document, and track software defects with Jira',
            ],
            skills: ['Selenium', 'Java', 'Python', 'API Testing', 'Cypress', 'Postman', 'Git'],
            preferredSkills: ['Jenkins', 'Docker', 'Appium', 'Performance Testing'],
            qualifications: [
              'B.Tech / B.E. in Computer Science or related degree',
              'Understanding of STLC, agile methodologies, and test automation design patterns',
            ],
            location: 'Pune, Maharashtra',
            salary: '₹5–8 LPA',
            experience: '1-3 years',
            workMode: 'Hybrid',
            jobType: 'Full-time',
            category: 'QA / Testing',
            source: 'Company Careers',
            originalUrl: 'https://careers.wipro.com/jobs/qa-automation-pune',
            externalId: 'WIPRO-QA-902',
            availableOnSources: ['Company Careers', 'Naukri', 'Foundit'],
            postedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
            isActive: true,
          },
          {
            title: 'Data Analyst',
            slug: 'data-analyst-flipkart-bengaluru',
            company: 'Flipkart',
            description:
              'Flipkart Marketplace Analytics is hiring a Data Analyst to extract business intelligence, uncover consumer trends, and build automated reporting dashboards.',
            responsibilities: [
              'Extract, transform, and analyze large datasets using SQL and Python',
              'Build interactive operational and executive dashboards using Tableau and Power BI',
              'Perform A/B test analysis to evaluate merchandising strategies',
              'Deliver strategic insights to business category managers and marketing leaders',
            ],
            skills: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel', 'Data Visualization', 'Statistics'],
            preferredSkills: ['BigQuery', 'Snowflake', 'Pandas', 'R'],
            qualifications: [
              'Degree in Mathematics, Statistics, Engineering, or Data Analytics',
              'Strong analytical mindset and proficiency in complex SQL querying',
            ],
            location: 'Bengaluru, Karnataka',
            salary: '₹7–11 LPA',
            experience: '1-3 years',
            workMode: 'Hybrid',
            jobType: 'Full-time',
            category: 'Data Analyst',
            source: 'Company Careers',
            originalUrl: 'https://careers.flipkart.com/jobs/data-analyst-blr',
            externalId: 'FLIP-DA-104',
            availableOnSources: ['Company Careers', 'LinkedIn'],
            postedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
            isActive: true,
          },
          {
            title: 'Technical Support Engineer',
            slug: 'technical-support-engineer-zoho-chennai',
            company: 'Zoho Corporation',
            description:
              'Provide top-tier technical support and troubleshooting for Zoho suite enterprise customers across North America and Europe.',
            responsibilities: [
              'Troubleshoot technical issues via ticketing, email, and scheduled video sessions',
              'Analyze logs, network traffic, and API request/response payloads',
              'Collaborate with product development engineers to resolve software bugs',
              'Author customer-facing knowledge base articles and troubleshooting guides',
            ],
            skills: ['Linux', 'Networking', 'SQL', 'Customer Support', 'API Troubleshooting', 'DNS'],
            preferredSkills: ['Bash Scripting', 'ITIL', 'REST APIs'],
            qualifications: [
              'Any graduate with excellent English written and verbal communication skills',
              'Technical background and passion for problem-solving',
            ],
            location: 'Chennai, Tamil Nadu',
            salary: '₹4–6.5 LPA',
            experience: '0-2 years',
            workMode: 'On-site',
            jobType: 'Full-time',
            category: 'Technical Support',
            source: 'Company Careers',
            originalUrl: 'https://careers.zohocorp.com/jobs/tech-support-chennai',
            externalId: 'ZOHO-TS-771',
            availableOnSources: ['Company Careers', 'Apna', 'Naukri'],
            postedAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
            isActive: true,
          },
          {
            title: 'Machine Learning Engineering Intern',
            slug: 'machine-learning-engineering-intern-phonepe-bengaluru',
            company: 'PhonePe',
            description:
              'Exciting 6-month internship with PhonePe AI Labs. Work on cutting-edge fraud detection models, recommendation systems, and real-time transaction scoring.',
            responsibilities: [
              'Assist in training, evaluating, and fine-tuning ML models for fraud detection',
              'Preprocess large-scale transactional data using PySpark and Pandas',
              'Benchmark model latencies and contribute to ML deployment pipelines',
              'Present findings to senior research scientists and engineering leadership',
            ],
            skills: ['Python', 'PyTorch', 'Scikit-Learn', 'Machine Learning', 'SQL', 'Pandas'],
            preferredSkills: ['NLP', 'Transformers', 'Docker', 'MLflow'],
            qualifications: [
              'Currently pursuing pre-final or final year B.Tech/M.Tech/MS in CS, AI, or Data Science',
              'Strong foundational knowledge of probability, linear algebra, and neural networks',
            ],
            location: 'Bengaluru, Karnataka',
            salary: '₹45,000 / month Stipend',
            experience: 'Fresher / Graduate',
            workMode: 'Hybrid',
            jobType: 'Internship',
            category: 'Machine Learning',
            source: 'Company Careers',
            originalUrl: 'https://careers.phonepe.com/jobs/ml-intern-2026',
            externalId: 'PPE-ML-INT-09',
            availableOnSources: ['Company Careers', 'LinkedIn'],
            postedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            isActive: true,
          },
        ];

        await this.jobModel.insertMany(seedJobs);
        this.logger.log(`Successfully seeded ${seedJobs.length} realistic development jobs.`);
      }
    } catch (err) {
      this.logger.warn(`Could not seed initial jobs (MongoDB may not be connected yet): ${err.message}`);
    }
  }

  async searchJobs(params: {
    search?: string;
    location?: string;
    category?: string;
    workMode?: string;
    jobType?: string;
    experience?: string;
    source?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: JobDocument[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 12));
    const skip = (page - 1) * limit;

    const query: any = { isActive: true };

    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { company: { $regex: term, $options: 'i' } },
        { skills: { $in: [new RegExp(term, 'i')] } },
        { category: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    if (params.location && params.location.trim()) {
      query.location = { $regex: params.location.trim(), $options: 'i' };
    }

    if (params.category && params.category !== 'All') {
      const escapedCategory = params.category
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\//g, '\\s*\\/\\s*');
      query.category = { $regex: escapedCategory, $options: 'i' };
    }

    if (params.workMode && params.workMode !== 'All') {
      query.workMode = params.workMode;
    }

    if (params.jobType && params.jobType !== 'All') {
      query.jobType = params.jobType;
    }

    if (params.experience && params.experience !== 'All') {
      query.experience = { $regex: params.experience, $options: 'i' };
    }

    if (params.source && params.source !== 'All') {
      let sourcePattern = params.source.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (params.source.toLowerCase().includes('company')) {
        sourcePattern = 'Company Career';
      }
      query.source = { $regex: sourcePattern, $options: 'i' };
    }

    let sortOption: any = { postedAt: -1 }; // Default Most Recent
    if (params.sort === 'relevance' && !params.search) {
      sortOption = { postedAt: -1 };
    }

    const [jobs, total] = await Promise.all([
      this.jobModel.find(query).sort(sortOption).skip(skip).limit(limit).exec(),
      this.jobModel.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlugOrId(identifier: string): Promise<JobDocument> {
    let job: JobDocument | null = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      job = await this.jobModel.findById(identifier).exec();
    }

    if (!job) {
      job = await this.jobModel.findOne({ slug: identifier, isActive: true }).exec();
    }

    if (!job) {
      // Also try inactive if admin/checking
      job = await this.jobModel.findOne({ slug: identifier }).exec();
    }

    if (!job) {
      throw new NotFoundException(`Job listing '${identifier}' not found`);
    }

    return job;
  }

  async createJob(jobData: Partial<Job>): Promise<JobDocument> {
    const slugBase = `${jobData.title || 'job'}-${jobData.company || 'company'}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let slug = slugBase;
    const existing = await this.jobModel.findOne({ slug });
    if (existing) {
      slug = `${slugBase}-${Date.now().toString().slice(-5)}`;
    }

    const newJob = new this.jobModel({
      ...jobData,
      slug,
      postedAt: jobData.postedAt || new Date(),
      isActive: jobData.isActive !== undefined ? jobData.isActive : true,
    });

    return newJob.save();
  }

  async updateJob(id: string, updateData: Partial<Job>): Promise<JobDocument> {
    let job: JobDocument | null = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      job = await this.jobModel.findById(id);
    }
    if (!job) {
      job = await this.jobModel.findOne({ slug: id });
    }

    if (!job) {
      throw new NotFoundException(`Job listing '${id}' not found`);
    }

    delete (updateData as any)._id;
    delete (updateData as any).slug; // preserve existing URL slug

    Object.assign(job, updateData);
    return job.save();
  }

  async toggleActive(id: string): Promise<JobDocument> {
    const job = await this.findBySlugOrId(id);
    job.isActive = !job.isActive;
    return job.save();
  }

  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    let result: any;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      result = await this.jobModel.findByIdAndDelete(id);
    } else {
      result = await this.jobModel.findOneAndDelete({ slug: id });
    }

    if (!result) {
      throw new NotFoundException(`Job listing '${id}' not found`);
    }

    return { success: true, message: 'Job listing deleted successfully' };
  }

  async getAllAdminJobs(params: {
    search?: string;
    source?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: JobDocument[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { company: { $regex: term, $options: 'i' } },
        { location: { $regex: term, $options: 'i' } },
        { skills: { $in: [new RegExp(term, 'i')] } },
      ];
    }

    if (params.source && params.source !== 'All') {
      query.source = { $regex: params.source, $options: 'i' };
    }

    if (params.category && params.category !== 'All') {
      query.category = { $regex: params.category, $options: 'i' };
    }

    if (params.status && params.status !== 'All') {
      query.isActive = params.status === 'Active';
    }

    const [jobs, total] = await Promise.all([
      this.jobModel.find(query).sort({ postedAt: -1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.jobModel.countDocuments(query),
    ]);

    return {
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSourcesStats(): Promise<{ source: string; count: number }[]> {
    const defaultSources = [
      'LinkedIn',
      'Naukri',
      'Indeed',
      'Foundit',
      'Apna',
      'Workday',
      'Company Career Website',
      'Other',
    ];

    const aggregated = await this.jobModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const item of aggregated) {
      countMap.set(item._id, item.count);
    }

    return defaultSources.map((source) => ({
      source,
      count: countMap.get(source) || countMap.get(source.replace(' Website', 's')) || 0,
    }));
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.jobModel.distinct('category', { isActive: true }).exec();
    const standardCategories = [
      'Software',
      'IT Support',
      'Technical Support',
      'QA/Testing',
      'Data',
      'AI/ML',
      'DevOps/Cloud',
      'Cybersecurity',
      'Finance',
      'HR',
      'Sales',
      'Marketing',
      'Operations',
      'Customer Support',
      'Internships',
      'Apprenticeships',
      'Fresher/Graduate',
      'Trainee',
      'Other',
    ];

    return Array.from(new Set([...standardCategories, ...categories]));
  }

  async countJobs(): Promise<number> {
    return this.jobModel.countDocuments({ isActive: true });
  }

  async countTotalJobs(): Promise<number> {
    return this.jobModel.countDocuments();
  }
}
