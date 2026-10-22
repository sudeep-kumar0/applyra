import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from '../users/users.service';
import { JobsService } from '../jobs/jobs.service';
import { GreenhouseScraperService } from '../jobs/scrapers/greenhouse.scraper';
import { ApplicationsService } from '../applications/applications.service';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jobsService: JobsService,
    private readonly greenhouseScraper: GreenhouseScraperService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Get('stats')
  async getAdminStats() {
    const [userCount, activeJobCount, totalJobCount, applicationCount, sources] =
      await Promise.all([
        this.usersService.countUsers(),
        this.jobsService.countJobs(),
        this.jobsService.countTotalJobs(),
        this.applicationsService.countAllApplications(),
        this.jobsService.getSourcesStats(),
      ]);

    return {
      success: true,
      stats: {
        totalUsers: userCount,
        activeJobs: activeJobCount,
        totalJobs: totalJobCount,
        totalApplications: applicationCount,
        sources,
        systemStatus: 'Operational',
      },
    };
  }

  @Get('jobs')
  async getAdminJobs(
    @Query('search') search?: string,
    @Query('source') source?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.jobsService.getAllAdminJobs({
      search,
      source,
      category,
      status,
      page,
      limit,
    });
  }

  @Post('jobs')
  async createJob(@Body() jobData: any) {
    if (!jobData.title || !jobData.company || !jobData.location) {
      throw new BadRequestException('Job title, company, and location are required');
    }

    if (!jobData.originalUrl || !jobData.originalUrl.trim()) {
      throw new BadRequestException('Original application URL is required');
    }

    // Clean up arrays if submitted as comma-separated strings
    if (typeof jobData.skills === 'string') {
      jobData.skills = jobData.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (typeof jobData.responsibilities === 'string') {
      jobData.responsibilities = jobData.responsibilities
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (typeof jobData.qualifications === 'string') {
      jobData.qualifications = jobData.qualifications
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    const job = await this.jobsService.createJob(jobData);
    return {
      success: true,
      message: 'Job listing posted successfully',
      job,
    };
  }

  @Put('jobs/:id')
  async updateJob(@Param('id') id: string, @Body() updateData: any) {
    if (typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (typeof updateData.responsibilities === 'string') {
      updateData.responsibilities = updateData.responsibilities
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (typeof updateData.qualifications === 'string') {
      updateData.qualifications = updateData.qualifications
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    const job = await this.jobsService.updateJob(id, updateData);
    return {
      success: true,
      message: 'Job listing updated successfully',
      job,
    };
  }

  @Patch('jobs/:id/status')
  async toggleJobStatus(@Param('id') id: string) {
    const job = await this.jobsService.toggleActive(id);
    return {
      success: true,
      isActive: job.isActive,
      message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`,
      job,
    };
  }

  @Delete('jobs/:id')
  async deleteJob(@Param('id') id: string) {
    return this.jobsService.deleteJob(id);
  }

  @Post('jobs/bulk-delete')
  async bulkDeleteJobs(@Body() body: { ids: string[] }) {
    if (!body || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('An array of job IDs is required');
    }
    return this.jobsService.bulkDeleteJobs(body.ids);
  }

  @Get('sources')
  async getSources() {
    const sources = await this.jobsService.getSourcesStats();
    return {
      success: true,
      sources,
    };
  }

  @Get('reports')
  async getReports() {
    // Currently return verified clean status / reports queue
    return {
      success: true,
      reports: [],
      message: 'All verified job reports reviewed',
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
      throw new BadRequestException('Email and role are required');
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

  // --- Greenhouse Scraper Endpoints ---

  @Get('scrape/greenhouse/presets')
  getGreenhousePresets() {
    return {
      success: true,
      presets: this.greenhouseScraper.getPresets(),
    };
  }

  @Post('scrape/greenhouse/preview')
  async previewGreenhouseJobs(@Body() body: { boardToken: string; limit?: number }) {
    if (!body.boardToken || !body.boardToken.trim()) {
      throw new BadRequestException('boardToken is required');
    }
    const result = await this.greenhouseScraper.previewJobs(
      body.boardToken.trim(),
      body.limit || 3,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Post('scrape/greenhouse/import')
  async importGreenhouseJobs(
    @Body()
    body: {
      boardToken: string;
      companyName?: string;
      companyLogo?: string;
      limit?: number;
      categoryOverride?: string;
      syncDeactivations?: boolean;
    },
  ) {
    if (!body.boardToken || !body.boardToken.trim()) {
      throw new BadRequestException('boardToken is required');
    }

    const result = await this.greenhouseScraper.importJobs({
      boardToken: body.boardToken.trim(),
      companyName: body.companyName?.trim(),
      companyLogo: body.companyLogo?.trim(),
      limit: body.limit,
      categoryOverride: body.categoryOverride?.trim(),
      syncDeactivations: body.syncDeactivations ?? false,
    });

    return {
      success: true,
      message: `Scraping completed: ${result.imported} new jobs imported, ${result.updated} updated`,
      result,
    };
  }
}
