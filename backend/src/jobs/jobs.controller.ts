import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getJobs(
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('category') category?: string,
    @Query('workMode') workMode?: string,
    @Query('jobType') jobType?: string,
    @Query('experience') experience?: string,
    @Query('source') source?: string,
    @Query('datePosted') datePosted?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.jobsService.searchJobs({
      search,
      location,
      category,
      workMode,
      jobType,
      experience,
      source,
      datePosted,
      sort,
      page,
      limit,
    });
  }

  @Get('categories')
  async getCategories() {
    return this.jobsService.getCategories();
  }

  @Get(':slugOrId')
  @UseGuards(OptionalAuthGuard)
  async getJobDetail(@Param('slugOrId') slugOrId: string) {
    const job = await this.jobsService.findBySlugOrId(slugOrId);
    return { job };
  }
}
