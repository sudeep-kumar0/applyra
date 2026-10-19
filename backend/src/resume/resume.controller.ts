import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ResumeService } from './resume.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('resume')
@UseGuards(SupabaseAuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  // POST /api/v1/resume/upload — upload PDF to Supabase
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF and DOCX files are allowed'), false);
        }
      },
    }),
  )
  async uploadResume(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const result = await this.resumeService.uploadResume(req.user._id, file);
    return { success: true, ...result };
  }

  // GET /api/v1/resume/active — get user's active resume status
  @Get('active')
  async getActiveResume(@Request() req: any) {
    const result = await this.resumeService.getActiveResume(req.user._id);
    return { success: true, ...result };
  }

  // GET /api/v1/resume/list — list user's uploaded resumes
  @Get('list')
  async listResumes(@Request() req: any) {
    const result = await this.resumeService.listResumes(req.user._id);
    return { success: true, ...result };
  }

  // GET /api/v1/resume/ats?job=slug — ATS score for a job
  @Get('ats')
  async getAtsScore(@Request() req: any, @Query('job') jobSlug: string) {
    if (!jobSlug) throw new BadRequestException('job query param is required');
    const result = await this.resumeService.getAtsScore(req.user._id, jobSlug);
    return { success: true, ...result };
  }

  // DELETE /api/v1/resume/:fileKey — delete a resume
  @Delete(':fileKey(*)')
  async deleteResume(@Request() req: any, @Param('fileKey') fileKey: string) {
    await this.resumeService.deleteResume(req.user._id, fileKey);
    return { success: true, message: 'Resume deleted' };
  }
}
