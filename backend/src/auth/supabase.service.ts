import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;
  private supabaseAdminClient: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      'https://mytywaubhmpmyyblofri.supabase.co';
    const supabaseAnonKey =
      this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY') ||
      'mock-anon-key-for-dev';
    const supabaseServiceKey =
      this.configService.get<string>('SUPABASE_SECRET_KEY') ||
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (supabaseServiceKey && supabaseServiceKey !== 'your_supabase_service_role_key_here') {
      this.supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.logger.log('Supabase Admin client initialized with Secret / Service Role Key.');
    } else {
      this.logger.warn(
        'SUPABASE_SECRET_KEY / SERVICE_ROLE_KEY not configured. Administrative operations will use standard client.',
      );
    }
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdminClient || this.supabaseClient;
  }

  async verifyToken(token: string): Promise<SupabaseAuthUser | null> {
    try {
      const { data, error } = await this.supabaseClient.auth.getUser(token);
      if (error || !data.user) {
        return null;
      }
      return data.user;
    } catch (err) {
      this.logger.error(`Error verifying Supabase token: ${err.message}`);
      return null;
    }
  }
}
