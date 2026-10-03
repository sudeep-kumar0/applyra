import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { OptionalAuthGuard } from './optional-auth.guard';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [UsersModule, ProfilesModule],
  controllers: [AuthController],
  providers: [SupabaseService, SupabaseAuthGuard, OptionalAuthGuard, AdminGuard],
  exports: [SupabaseService, SupabaseAuthGuard, OptionalAuthGuard, AdminGuard],
})
export class AuthModule {}
