import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true, collection: 'jobs' })
export class Job {
  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true, index: true })
  company: string;

  @Prop({ default: '' })
  companyId: string;

  @Prop({ default: '' })
  companyLogo: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  responsibilities: string[];

  @Prop({ type: [String], default: [], index: true })
  skills: string[];

  @Prop({ type: [String], default: [] })
  preferredSkills: string[];

  @Prop({ type: [String], default: [] })
  qualifications: string[];

  @Prop({ required: true, trim: true, index: true })
  location: string;

  @Prop({ default: 'Not disclosed' })
  salary: string;

  @Prop({ default: '0-2 years' })
  experience: string;

  @Prop({ required: true, enum: ['Remote', 'Hybrid', 'On-site'], index: true })
  workMode: string;

  @Prop({
    required: true,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Apprenticeship'],
    index: true,
  })
  jobType: string;

  @Prop({ required: true, trim: true, index: true })
  category: string;

  @Prop({ required: true, default: 'Company Careers', index: true })
  source: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({ default: '' })
  externalId: string;

  @Prop({ type: [String], default: [] })
  availableOnSources: string[];

  @Prop({ default: Date.now, index: true })
  postedAt: Date;

  @Prop({ default: null })
  expiresAt: Date;

  @Prop({ default: true, index: true })
  isActive: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// Text search index for title, company, description, skills, location
JobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  location: 'text',
  skills: 'text',
});
