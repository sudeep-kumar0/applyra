import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from '../users/users.service';
import { JobsService } from '../jobs/jobs.service';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jobsService: JobsService,
  ) {}

  @Get('stats')
  async getAdminStats() {
    const [userCount, jobCount] = await Promise.all([
      this.usersService.countUsers(),
      this.jobsService.countJobs(),
    ]);

    return {
      success: true,
      stats: {
        totalUsers: userCount,
        totalJobs: jobCount,
        activeSources: ['Company Careers', 'Direct Portals'],
        systemStatus: 'Operational',
      },
    };
  }

  @Get('users')
  async getUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.usersService.findAll(page, limit);
    return {
      success: true,
      ...result,
    };
  }

  @Post('set-role')
  async setUserRole(@Body() body: { email: string; role: UserRole }) {
    if (!body.email || !body.role) {
      throw new NotFoundException('Email and role are required');
    }
    const updated = await this.usersService.setUserRole(body.email, body.role);
    if (!updated) {
      throw new NotFoundException(`User with email ${body.email} not found`);
    }
    return {
      success: true,
      user: {
        id: updated._id,
        email: updated.email,
        role: updated.role,
      },
    };
  }
}
