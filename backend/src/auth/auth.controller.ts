import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { ProfilesService } from '../profiles/profiles.service';
import { UserRole } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('sync')
  @UseGuards(SupabaseAuthGuard)
  async syncUser(@Request() req: any) {
    const user = req.user;
    const metadata = req.supabaseUser?.user_metadata || {};
    const fullName =
      metadata.full_name ||
      metadata.name ||
      [metadata.given_name, metadata.family_name].filter(Boolean).join(' ') ||
      '';
    const profilePhoto = metadata.avatar_url || metadata.picture || '';

    const profile = await this.profilesService.findOrCreate(user._id, {
      fullName,
      profilePhoto,
    });

    const is_admin = Boolean(
      user.is_admin === true ||
      (user as any).is_Admin === true ||
      user.role === UserRole.ADMIN,
    );

    return {
      success: true,
      user: {
        id: user._id,
        supabaseUserId: user.supabaseUserId,
        email: user.email,
        role: user.role,
        is_admin,
        is_Admin: is_admin,
        isAdmin: is_admin,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      profile,
    };
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getMe(@Request() req: any) {
    const user = req.user;
    const profile = await this.profilesService.findByUserId(user._id);

    const is_admin = Boolean(
      user.is_admin === true ||
      (user as any).is_Admin === true ||
      user.role === UserRole.ADMIN,
    );

    return {
      user: {
        id: user._id,
        supabaseUserId: user.supabaseUserId,
        email: user.email,
        role: user.role,
        is_admin,
        is_Admin: is_admin,
        isAdmin: is_admin,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      profile,
    };
  }
}
