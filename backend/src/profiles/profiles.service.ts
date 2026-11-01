import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(@InjectModel(Profile.name) private profileModel: Model<ProfileDocument>) {}

  async findByUserId(userId: string | Types.ObjectId): Promise<ProfileDocument | null> {
    const objectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.profileModel.findOne({ userId: objectId }).exec();
  }

  async findOrCreate(
    userId: string | Types.ObjectId,
    initialData: Partial<Profile> = {},
  ): Promise<ProfileDocument> {
    const objectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    let profile = await this.profileModel.findOne({ userId: objectId }).exec();

    if (!profile) {
      profile = new this.profileModel({
        userId: objectId,
        ...initialData,
        profileCompletion: this.calculateCompletion(initialData),
      });
      await profile.save();
    } else {
      let updated = false;
      if (!profile.fullName && initialData.fullName) {
        profile.fullName = initialData.fullName;
        updated = true;
      }
      if (!profile.profilePhoto && initialData.profilePhoto) {
        profile.profilePhoto = initialData.profilePhoto;
        updated = true;
      }
      if (updated) {
        profile.profileCompletion = this.calculateCompletion(profile);
        await profile.save();
      }
    }

    return profile;
  }

  async updateProfile(
    userId: string | Types.ObjectId,
    updateData: Partial<Profile>,
  ): Promise<ProfileDocument> {
    const objectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    let profile = await this.profileModel.findOne({ userId: objectId });
    if (!profile) {
      profile = new this.profileModel({ userId: objectId });
    }

    Object.assign(profile, updateData);
    profile.profileCompletion = this.calculateCompletion(profile);

    return profile.save();
  }

  calculateCompletion(profile: any): number {
    let score = 0;
    if (profile.fullName && profile.fullName.trim()) score += 15;
    if (profile.headline && profile.headline.trim()) score += 15;
    if (profile.location && profile.location.trim()) score += 10;
    if (profile.phone && profile.phone.trim()) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (
      (profile.experience && profile.experience.length > 0) ||
      (profile.internships && profile.internships.length > 0)
    )
      score += 15;
    if (profile.education && profile.education.length > 0) score += 15;

    return Math.min(100, Math.max(10, score));
  }
}
