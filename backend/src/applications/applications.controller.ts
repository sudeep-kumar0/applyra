import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { ApplicationStatus } from './schemas/application.schema';

@Controller('applications')
@UseGuards(SupabaseAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('click')
  async recordClick(@Request() req: any, @Body() body: { jobId: string }) {
    const application = await this.applicationsService.recordApplyClick(req.user._id, body.jobId);
    return { success: true, application };
  }

  @Post('confirm')
  async confirmApply(
    @Request() req: any,
    @Body() body: { jobId: string; notes?: string },
  ) {
    return this.applicationsService.confirmApply(req.user._id, body.jobId, body.notes);
  }

  @Get()
  async getApplications(@Request() req: any, @Query('status') status?: string) {
    const applications = await this.applicationsService.getUserApplications(req.user._id, status);
    return { success: true, applications };
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    const stats = await this.applicationsService.getUserStats(req.user._id);
    return { success: true, stats };
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { status: ApplicationStatus; notes?: string },
  ) {
    const application = await this.applicationsService.updateStatus(
      req.user._id,
      id,
      body.status,
      body.notes,
    );
    return { success: true, application };
  }
}
