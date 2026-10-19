import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { JobsModule } from './jobs/jobs.module';
import { AdminModule } from './admin/admin.module';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';
import { CommonModule } from './common/common.module';
import { ResumeModule } from './resume/resume.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri =
          configService.get<string>('MONGODB_URI') ||
          'mongodb://127.0.0.1:27017/applyra';
        return {
          uri,
          serverSelectionTimeoutMS: 5000,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    JobsModule,
    AdminModule,
    ApplicationsModule,
    NotificationsModule,
    StorageModule,
    CommonModule,
    ResumeModule,
  ],
})
export class AppModule {}
