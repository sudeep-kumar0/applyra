import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findBySupabaseId(supabaseUserId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ supabaseUserId }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async syncSupabaseUser(supabaseUserId: string, email: string): Promise<UserDocument> {
    const normalizedEmail = email.toLowerCase().trim();
    let user = await this.userModel.findOne({
      $or: [{ supabaseUserId }, { email: normalizedEmail }],
    });

    if (!user) {
      this.logger.log(`Creating new MongoDB user for Supabase ID: ${supabaseUserId}`);
      user = new this.userModel({
        supabaseUserId,
        email: normalizedEmail,
        role: UserRole.USER, // Mandatory default: NEVER allow client to choose ADMIN
        is_admin: false,
        lastLoginAt: new Date(),
      });
      await user.save();
    } else {
      user.supabaseUserId = supabaseUserId;
      user.lastLoginAt = new Date();
      await user.save();
    }

    return user;
  }

  async setUserRole(email: string, role: UserRole, is_admin?: boolean): Promise<UserDocument | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const adminFlag = is_admin !== undefined ? is_admin : role === UserRole.ADMIN;
    const user = await this.userModel.findOneAndUpdate(
      { email: normalizedEmail },
      { role, is_admin: adminFlag },
      { new: true },
    );
    return user;
  }

  async setIsAdmin(email: string, is_admin: boolean): Promise<UserDocument | null> {
    const normalizedEmail = email.toLowerCase().trim();
    return this.userModel.findOneAndUpdate(
      { email: normalizedEmail },
      { is_admin, role: is_admin ? UserRole.ADMIN : UserRole.USER },
      { new: true },
    );
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async findAll(page = 1, limit = 20): Promise<{ users: UserDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find().select('-__v').sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(),
    ]);
    return { users, total };
  }
}
