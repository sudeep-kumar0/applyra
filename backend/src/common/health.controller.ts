import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { SupabaseService } from '../auth/supabase.service';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  async getHealth() {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const mongoState = this.connection.readyState;
    const mongoStatusMap: Record<number, string> = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    const isMongoOk = mongoState === 1;

    return {
      status: isMongoOk ? 'healthy' : 'degraded',
      service: 'Applyra REST API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        type: 'MongoDB Atlas',
        status: mongoStatusMap[mongoState] || 'Unknown',
        connected: isMongoOk,
      },
      auth: {
        provider: 'Supabase Auth',
        status: 'Configured',
      },
      storage: {
        provider: 'Supabase Storage',
        bucket: 'resumes (private)',
        status: 'Configured',
      },
    };
  }
}
