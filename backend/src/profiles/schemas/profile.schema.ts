import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true, collection: 'profiles' })
export class Profile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ default: '', trim: true })
  fullName: string;

  @Prop({ default: '' })
  profilePhoto: string;

  @Prop({ default: '', trim: true })
  headline: string;

  @Prop({ default: '', trim: true })
  location: string;

  @Prop({ default: '', trim: true })
  phone: string;

  @Prop({ default: '' })
  college: string;

  @Prop({ default: '' })
  degree: string;

  @Prop({ default: null })
  graduationYear: number;

  @Prop({ type: [Object], default: [] })
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
  }>;

  @Prop({ type: [String], default: [], index: true })
  skills: string[];

  @Prop({ type: [Object], default: [] })
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  internships: Array<{
    title: string;
    company: string;
    duration?: string;
    description?: string;
  }>;

  @Prop({ type: [Object], default: [] })
  projects: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;

  @Prop({ type: [String], default: [] })
  certifications: string[];

  @Prop({ type: [String], default: [] })
  preferredRoles: string[];

  @Prop({ type: [String], default: [] })
  preferredLocations: string[];

  @Prop({ default: 'Any', enum: ['Any', 'Remote', 'Hybrid', 'On-site'] })
  preferredWorkMode: string;

  @Prop({ default: '' })
  expectedSalary: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: 15, min: 0, max: 100 })
  profileCompletion: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
