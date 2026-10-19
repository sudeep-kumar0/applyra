import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from '../profiles/schemas/profile.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { SupabaseService } from '../auth/supabase.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);
  private readonly bucketName: string;

  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('STORAGE_BUCKET') || 'resumes';
  }

  // ─── Extract text from PDF/DOCX buffer ─────────────────────────────────────
  private async extractTextFromBuffer(buffer: Buffer, mimetype: string, filename: string): Promise<string> {
    try {
      const isPdf = mimetype === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        const pdfModule = require('pdf-parse');
        if (pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: buffer });
          const res = await parser.getText();
          return res?.text || '';
        } else if (typeof pdfModule === 'function') {
          const res = await pdfModule(buffer);
          return res?.text || '';
        } else if (pdfModule.default && typeof pdfModule.default === 'function') {
          const res = await pdfModule.default(buffer);
          return res?.text || '';
        }
      }
      return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    } catch (err: any) {
      this.logger.warn(`Could not extract text from uploaded resume: ${err.message}`);
      return '';
    }
  }

  // ─── Upload resume to Supabase Storage & extract text ───────────────────────
  async uploadResume(
    userId: string | Types.ObjectId,
    file: Express.Multer.File,
  ): Promise<{ fileKey: string; signedUrl: string; fileName: string; textExtracted: boolean }> {
    if (!file) throw new BadRequestException('No file provided');

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const isPdfOrDoc =
      allowedTypes.includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith('.pdf') ||
      file.originalname.toLowerCase().endsWith('.docx');

    if (!isPdfOrDoc) {
      throw new BadRequestException('Only PDF and DOCX files are supported');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size must be under 10MB');
    }

    const userIdStr = userId.toString();
    const timestamp = Date.now();
    const isPdf = file.originalname.toLowerCase().endsWith('.pdf');
    const ext = isPdf ? 'pdf' : 'docx';
    const safeName = file.originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const fileKey = `${userIdStr}/${timestamp}_${safeName}.${ext}`;

    const adminClient = this.supabaseService.getAdminClient();
    const { error: uploadError } = await adminClient.storage
      .from(this.bucketName)
      .upload(fileKey, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      this.logger.error(`Resume upload failed: ${uploadError.message}`);
      throw new BadRequestException(`Upload failed: ${uploadError.message}`);
    }

    const { data: signedData, error: signedError } = await adminClient.storage
      .from(this.bucketName)
      .createSignedUrl(fileKey, 3600);

    if (signedError || !signedData?.signedUrl) {
      throw new BadRequestException('Could not generate download URL');
    }

    // Extract text from the uploaded resume file
    const extractedText = await this.extractTextFromBuffer(file.buffer, file.mimetype, file.originalname);

    // Save as active resume in the user's profile
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    await this.profileModel.findOneAndUpdate(
      { userId: userObjectId },
      {
        $set: {
          resumeKey: fileKey,
          resumeFileName: file.originalname,
          resumeUploadedAt: new Date(),
          resumeText: extractedText,
        },
      },
      { upsert: true, new: true },
    );

    return {
      fileKey,
      signedUrl: signedData.signedUrl,
      fileName: file.originalname,
      textExtracted: extractedText.length > 0,
    };
  }

  // ─── Get active resume details ─────────────────────────────────────────────
  async getActiveResume(userId: string | Types.ObjectId): Promise<{
    hasResume: boolean;
    fileName: string;
    fileKey: string;
    uploadedAt: Date | null;
  }> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const profile = await this.profileModel.findOne({ userId: userObjectId }).exec();

    if (!profile || !profile.resumeKey) {
      return {
        hasResume: false,
        fileName: '',
        fileKey: '',
        uploadedAt: null,
      };
    }

    return {
      hasResume: true,
      fileName: profile.resumeFileName || 'Current Resume',
      fileKey: profile.resumeKey,
      uploadedAt: profile.resumeUploadedAt || null,
    };
  }

  // ─── List user's uploaded resumes ──────────────────────────────────────────
  async listResumes(userId: string | Types.ObjectId): Promise<{ files: any[] }> {
    const userIdStr = userId.toString();
    const adminClient = this.supabaseService.getAdminClient();
    const { data, error } = await adminClient.storage.from(this.bucketName).list(userIdStr, {
      limit: 20,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      this.logger.warn(`Could not list resumes: ${error.message}`);
      return { files: [] };
    }

    const files = await Promise.all(
      (data || []).map(async (f) => {
        const fileKey = `${userIdStr}/${f.name}`;
        const { data: sd } = await adminClient.storage
          .from(this.bucketName)
          .createSignedUrl(fileKey, 3600);
        return {
          name: f.name,
          fileKey,
          signedUrl: sd?.signedUrl || null,
          size: f.metadata?.size || 0,
          createdAt: f.created_at,
        };
      }),
    );

    return { files };
  }

  // ─── ATS Score: compare resume text directly against job requirements ───────
  async getAtsScore(
    userId: string | Types.ObjectId,
    jobSlug: string,
  ): Promise<{
    hasResume: boolean;
    resumeFileName: string;
    score: number;
    level: string;
    jobTitle: string;
    company: string;
    jobSlug: string;
    requiredSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
    tip: string;
  }> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    // Find the job by slug or id
    let job: JobDocument | null = null;
    if (jobSlug.match(/^[0-9a-fA-F]{24}$/)) {
      job = await this.jobModel.findById(jobSlug).exec();
    }
    if (!job) {
      job = await this.jobModel.findOne({ slug: jobSlug }).exec();
    }
    if (!job) throw new NotFoundException(`Job '${jobSlug}' not found`);

    const requiredSkills: string[] = [
      ...(job.skills || []),
      ...(job.preferredSkills || []),
    ];
    // Deduplicate case-insensitively
    const seen = new Set<string>();
    const uniqueRequired: string[] = [];
    for (const s of requiredSkills) {
      const lower = s.toLowerCase().trim();
      if (!seen.has(lower) && lower.length > 0) {
        seen.add(lower);
        uniqueRequired.push(s.trim());
      }
    }

    // Get user profile
    const profile = await this.profileModel.findOne({ userId: userObjectId }).exec();

    // Check if resume exists
    if (!profile || (!profile.resumeText && !profile.resumeKey)) {
      return {
        hasResume: false,
        resumeFileName: '',
        score: 0,
        level: 'No Resume Uploaded',
        jobTitle: job.title,
        company: job.company,
        jobSlug: job.slug,
        requiredSkills: uniqueRequired,
        matchedSkills: [],
        missingSkills: uniqueRequired,
        tip: 'Please upload your resume above to check your ATS match score against this role.',
      };
    }

    let resumeText = profile.resumeText || '';

    // If resumeKey exists but text wasn't cached yet, download and extract on-the-fly
    if (!resumeText && profile.resumeKey) {
      try {
        const adminClient = this.supabaseService.getAdminClient();
        const { data: fileData, error: dlError } = await adminClient.storage
          .from(this.bucketName)
          .download(profile.resumeKey);

        if (!dlError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          resumeText = await this.extractTextFromBuffer(
            buffer,
            'application/pdf',
            profile.resumeFileName || 'resume.pdf',
          );
          if (resumeText) {
            profile.resumeText = resumeText;
            await profile.save();
          }
        }
      } catch (err: any) {
        this.logger.warn(`Could not on-the-fly extract resume text: ${err.message}`);
      }
    }

    // Match each required job skill against the resume text
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of uniqueRequired) {
      if (this.isSkillInResume(skill, resumeText)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    const total = uniqueRequired.length;
    const score = total === 0 ? 100 : Math.round((matchedSkills.length / total) * 100);

    const level =
      score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Low';

    const tip =
      score >= 80
        ? `Great match! Your resume contains ${matchedSkills.length} of ${total} key skills for this position. Apply with confidence.`
        : score >= 60
          ? `Solid match (${score}%). Adding mentions of ${missingSkills.slice(0, 2).join(' or ')} to your resume could increase your ATS ranking.`
          : score >= 40
            ? `Moderate match. This role strongly expects skills like ${missingSkills.slice(0, 3).join(', ')}. If you have experience with these, make sure they appear explicitly in your resume.`
            : `Low match for this role. Your resume is missing key requirements: ${missingSkills.slice(0, 4).join(', ')}. Tailor your resume before applying.`;

    return {
      hasResume: true,
      resumeFileName: profile.resumeFileName || 'Active Resume',
      score,
      level,
      jobTitle: job.title,
      company: job.company,
      jobSlug: job.slug,
      requiredSkills: uniqueRequired,
      matchedSkills,
      missingSkills,
      tip,
    };
  }

  // ─── Delete a resume from Supabase Storage ─────────────────────────────────
  async deleteResume(userId: string | Types.ObjectId, fileKey: string): Promise<void> {
    const userIdStr = userId.toString();
    if (!fileKey.startsWith(userIdStr + '/')) {
      throw new BadRequestException('You can only delete your own files');
    }

    const adminClient = this.supabaseService.getAdminClient();
    const { error } = await adminClient.storage.from(this.bucketName).remove([fileKey]);
    if (error) throw new BadRequestException(`Delete failed: ${error.message}`);

    // If the active resume was deleted, clear it from the profile
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const profile = await this.profileModel.findOne({ userId: userObjectId }).exec();
    if (profile && profile.resumeKey === fileKey) {
      profile.resumeKey = '';
      profile.resumeFileName = '';
      profile.resumeText = '';
      profile.resumeUploadedAt = null as any;
      await profile.save();
    }
  }

  // ─── Match skill in resume text ───────────────────────────────────────────
  private isSkillInResume(skill: string, resumeText: string): boolean {
    if (!skill || !resumeText) return false;

    const lowerSkill = skill.toLowerCase().trim();
    const lowerText = resumeText.toLowerCase();

    // 1. Exact boundary match (handles symbols like C++, C#, .NET)
    const escaped = lowerSkill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const boundaryRegex = new RegExp(`(^|[^a-z0-9+#])${escaped}([^a-z0-9+#]|$)`, 'i');
    if (boundaryRegex.test(lowerText)) {
      return true;
    }

    // 2. Collapsed alphanumeric match (e.g. "Spring Boot" -> matches "springboot")
    const collapsedSkill = lowerSkill.replace(/[^a-z0-9]/g, '');
    const collapsedText = lowerText.replace(/[^a-z0-9]/g, ' ');
    if (
      collapsedSkill.length >= 3 &&
      new RegExp(`(^|\\s)${collapsedSkill}(\\s|$)`).test(collapsedText)
    ) {
      return true;
    }

    // 3. Known industry tech synonym mapping
    const synonyms: Record<string, string[]> = {
      react: ['reactjs', 'react.js'],
      'react.js': ['react', 'reactjs'],
      reactjs: ['react', 'react.js'],
      node: ['nodejs', 'node.js'],
      'node.js': ['node', 'nodejs'],
      nodejs: ['node', 'node.js'],
      express: ['expressjs', 'express.js'],
      'express.js': ['express', 'expressjs'],
      expressjs: ['express', 'express.js'],
      vue: ['vuejs', 'vue.js'],
      'vue.js': ['vue', 'vuejs'],
      vuejs: ['vue', 'vue.js'],
      angular: ['angularjs', 'angular.js'],
      next: ['nextjs', 'next.js'],
      'next.js': ['next', 'nextjs'],
      nextjs: ['next', 'next.js'],
      docker: ['container', 'containers', 'containerization'],
      kubernetes: ['k8s'],
      k8s: ['kubernetes'],
      'ai/ml': ['machine learning', 'artificial intelligence', 'deep learning'],
      'machine learning': ['ml', 'ai/ml', 'deep learning', 'scikit-learn'],
      'artificial intelligence': ['ai', 'ai/ml'],
      ml: ['machine learning', 'ai/ml'],
      ai: ['artificial intelligence', 'ai/ml'],
      postgres: ['postgresql'],
      postgresql: ['postgres'],
      mongo: ['mongodb'],
      mongodb: ['mongo'],
      rest: ['restful', 'rest api', 'rest apis'],
      'rest api': ['restful', 'rest', 'rest apis', 'restful apis'],
      'rest apis': ['restful', 'rest', 'rest api', 'restful apis'],
      aws: ['amazon web services', 'ec2', 's3', 'lambda'],
      gcp: ['google cloud', 'google cloud platform'],
      azure: ['microsoft azure'],
      'ci/cd': ['cicd', 'continuous integration', 'github actions', 'jenkins', 'pipeline'],
      git: ['github', 'gitlab', 'bitbucket'],
      github: ['git'],
      html: ['html5'],
      css: ['css3', 'tailwind', 'bootstrap'],
      typescript: ['ts'],
      javascript: ['js'],
      python: ['py'],
      sql: ['mysql', 'postgresql', 'sqlite', 'dbms', 'rdbms'],
      'spring boot': ['springboot', 'spring framework'],
      springboot: ['spring boot', 'spring framework'],
    };

    const aliases = synonyms[lowerSkill] || [];
    for (const alias of aliases) {
      const escAlias = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      if (new RegExp(`(^|[^a-z0-9+#])${escAlias}([^a-z0-9+#]|$)`, 'i').test(lowerText)) {
        return true;
      }
    }

    return false;
  }
}
