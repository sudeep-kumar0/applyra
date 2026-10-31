import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { AuthModule } from '../auth/auth.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [UsersModule, JobsModule, AuthModule, ApplicationsModule],
  controllers: [AdminController],
})
export class AdminModule {}
