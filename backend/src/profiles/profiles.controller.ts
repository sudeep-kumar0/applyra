import { Body, Controller, Get, Put, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('profile')
@UseGuards(SupabaseAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async getProfile(@Request() req: any) {
    const profile = await this.profilesService.findOrCreate(req.user._id);
    return {
      profile,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
    };
  }

  @Put()
  async updateProfile(@Request() req: any, @Body() updateDto: any) {
    // Prevent updating protected fields like userId
    delete updateDto.userId;
    delete updateDto._id;

    const updated = await this.profilesService.updateProfile(req.user._id, updateDto);
    return {
      success: true,
      profile: updated,
    };
  }
}
