import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

export enum ApplicationStatus {
  SAVED = 'SAVED',
  APPLIED = 'APPLIED',
  ASSESSMENT = 'ASSESSMENT',
  INTERVIEW = 'INTERVIEW',
  HR_ROUND = 'HR_ROUND',
  OFFER = 'OFFER',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

@Schema({ timestamps: true, collection: 'applications' })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true, index: true })
  jobId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  company: string;

  @Prop({ required: true, trim: true })
  role: string;

  @Prop({ required: true, default: 'Company Career Website' })
  source: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({
    required: true,
    enum: ApplicationStatus,
    default: ApplicationStatus.SAVED,
    index: true,
  })
  status: ApplicationStatus;

  @Prop({ default: null })
  appliedAt: Date;

  @Prop({ default: Date.now })
  clickedAt: Date;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: '' })
  resumeUsed: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

// Compound index to prevent duplicate records per user and job
ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
