import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private bucketName: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('STORAGE_BUCKET') || 'resumes';
  }

  async onModuleInit() {
    await this.verifyOrInitBucket();
  }

  async verifyOrInitBucket() {
    try {
      const adminClient = this.supabaseService.getAdminClient();
      const { data: buckets, error } = await adminClient.storage.listBuckets();

      if (error) {
        this.logger.warn(`Supabase Storage check: ${error.message}`);
        return;
      }

      const exists = buckets?.some((b) => b.name === this.bucketName);
      if (!exists) {
        this.logger.log(`Creating private bucket '${this.bucketName}' on Supabase Storage...`);
        const { error: createError } = await adminClient.storage.createBucket(this.bucketName, {
          public: false, // MANDATORY: Resume files must NOT be publicly accessible
          fileSizeLimit: 10485760, // 10MB limit
          allowedMimeTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
        });

        if (createError) {
          this.logger.warn(`Notice: Could not automatically create bucket: ${createError.message}. Ensure '${this.bucketName}' bucket exists in Supabase Dashboard.`);
        } else {
          this.logger.log(`Private bucket '${this.bucketName}' initialized successfully.`);
        }
      } else {
        this.logger.log(`Verified private bucket '${this.bucketName}' is active.`);
      }
    } catch (err) {
      this.logger.warn(`Storage init check skipped: ${err.message}`);
    }
  }

  async createSignedUrl(fileKey: string, expiresInSeconds = 3600): Promise<string | null> {
    const adminClient = this.supabaseService.getAdminClient();
    const { data, error } = await adminClient.storage
      .from(this.bucketName)
      .createSignedUrl(fileKey, expiresInSeconds);

    if (error) {
      this.logger.error(`Error creating signed URL for ${fileKey}: ${error.message}`);
      return null;
    }
    return data.signedUrl;
  }
}
