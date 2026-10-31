import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { GreenhouseScraperService } from './scrapers/greenhouse.scraper';
import { GreenhouseCronService } from './greenhouse-cron.service';
import { WorkdayScraperService } from './scrapers/workday.scraper';
import { WorkdayCronService } from './workday-cron.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    forwardRef(() => AuthModule),
    UsersModule,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    GreenhouseScraperService,
    GreenhouseCronService,
    WorkdayScraperService,
    WorkdayCronService,
  ],
  exports: [
    JobsService,
    GreenhouseScraperService,
    GreenhouseCronService,
    WorkdayScraperService,
    WorkdayCronService,
    MongooseModule,
  ],
})
export class JobsModule {}
