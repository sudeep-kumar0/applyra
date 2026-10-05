import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument, ApplicationStatus } from './schemas/application.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { Job, JobDocument } from '../jobs/schemas/job.schema';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async recordApplyClick(
    userId: Types.ObjectId | string,
    jobId: string,
  ): Promise<ApplicationDocument> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    let job: JobDocument | null = null;
    if (jobId.match(/^[0-9a-fA-F]{24}$/)) {
      job = await this.jobModel.findById(jobId).exec();
    }
    if (!job) {
      job = await this.jobModel.findOne({ slug: jobId }).exec();
    }

    if (!job) {
      throw new NotFoundException(`Job listing '${jobId}' not found`);
    }

    const jobObjectId = job._id as Types.ObjectId;

    let application = await this.applicationModel.findOne({
      userId: userObjectId,
      jobId: jobObjectId,
    });

    if (!application) {
      application = new this.applicationModel({
        userId: userObjectId,
        jobId: jobObjectId,
        company: job.company,
        role: job.title,
        source: job.source || 'Company Career Website',
        originalUrl: job.originalUrl,
        status: ApplicationStatus.SAVED,
        clickedAt: new Date(),
      });
      await application.save();
    } else {
      application.clickedAt = new Date();
      await application.save();
    }

    return application;
  }

  async confirmApply(
    userId: Types.ObjectId | string,
    jobId: string,
    notes = '',
  ): Promise<{ success: boolean; application: ApplicationDocument; stats: any }> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    let job: JobDocument | null = null;
    if (jobId.match(/^[0-9a-fA-F]{24}$/)) {
      job = await this.jobModel.findById(jobId).exec();
    }
    if (!job) {
      job = await this.jobModel.findOne({ slug: jobId }).exec();
    }

    if (!job) {
      throw new NotFoundException(`Job listing '${jobId}' not found`);
    }

    const jobObjectId = job._id as Types.ObjectId;

    let application = await this.applicationModel.findOne({
      userId: userObjectId,
      jobId: jobObjectId,
    });

    const wasAlreadyApplied = application?.status === ApplicationStatus.APPLIED;

    if (!application) {
      application = new this.applicationModel({
        userId: userObjectId,
        jobId: jobObjectId,
        company: job.company,
        role: job.title,
        source: job.source || 'Company Career Website',
        originalUrl: job.originalUrl,
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(),
        notes,
      });
      await application.save();
    } else {
      application.status = ApplicationStatus.APPLIED;
      if (!application.appliedAt) {
        application.appliedAt = new Date();
      }
      if (notes) application.notes = notes;
      await application.save();
    }

    // Only create notification if wasn't already marked as applied (avoid double notification)
    if (!wasAlreadyApplied) {
      await this.notificationsService.createNotification(
        userObjectId,
        'Application marked as Applied',
        `You marked your application for "${job.title}" at ${job.company} (${job.source}) as Applied.`,
        'APPLICATION_APPLIED',
        '/applications',
      );
    }

    const stats = await this.getUserStats(userObjectId);

    return {
      success: true,
      application,
      stats,
    };
  }

  async getUserApplications(
    userId: Types.ObjectId | string,
    statusFilter?: string,
  ): Promise<ApplicationDocument[]> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const query: any = { userId: userObjectId };

    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter.toUpperCase();
    }

    return this.applicationModel
      .find(query)
      .sort({ appliedAt: -1, updatedAt: -1, createdAt: -1 })
      .exec();
  }

  async updateStatus(
    userId: Types.ObjectId | string,
    applicationId: string,
    status: ApplicationStatus,
    notes?: string,
  ): Promise<ApplicationDocument> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const application = await this.applicationModel.findOne({
      _id: new Types.ObjectId(applicationId),
      userId: userObjectId,
    });

    if (!application) {
      throw new NotFoundException('Application record not found');
    }

    application.status = status;
    if (status === ApplicationStatus.APPLIED && !application.appliedAt) {
      application.appliedAt = new Date();
    }
    if (notes !== undefined) {
      application.notes = notes;
    }

    await application.save();

    await this.notificationsService.createNotification(
      userObjectId,
      `Application status updated: ${status}`,
      `Your application for ${application.role} at ${application.company} is now ${status}.`,
      'APPLICATION_STATUS_UPDATED',
      '/applications',
    );

    return application;
  }

  async getUserStats(userId: Types.ObjectId | string): Promise<{
    totalApplications: number;
    totalApplied: number;
    interviews: number;
    assessments: number;
    offers: number;
    rejected: number;
    saved: number;
  }> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const [
      totalApplications,
      totalApplied,
      interviews,
      assessments,
      offers,
      rejected,
      saved,
    ] = await Promise.all([
      this.applicationModel.countDocuments({
        userId: userObjectId,
        status: { $ne: ApplicationStatus.SAVED },
      }),
      this.applicationModel.countDocuments({
        userId: userObjectId,
        status: ApplicationStatus.APPLIED,
      }),
      this.applicationModel.countDocuments({
        userId: userObjectId,
        status: { $in: [ApplicationStatus.INTERVIEW, ApplicationStatus.HR_ROUND] },
      }),
      this.applicationModel.countDocuments({
        userId: userObjectId,
        status: ApplicationStatus.ASSESSMENT,
      }),
      this.applicationModel.countDocuments({
        userId: userObjectId,
        status: { $in: [ApplicationStatus.OFFER, ApplicationStatus.SELECTED] },
      }),
      this.applicationModel.countDocuments({
        userId: userObjectId,
        status: ApplicationStatus.REJECTED,
      }),
      this.applicationModel.countDocuments({
        userId: userObjectId,
        status: ApplicationStatus.SAVED,
      }),
    ]);

    return {
      totalApplications,
      totalApplied,
      interviews,
      assessments,
      offers,
      rejected,
      saved,
    };
  }

  async countAllApplications(): Promise<number> {
    return this.applicationModel.countDocuments();
  }
}
