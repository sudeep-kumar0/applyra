import { Controller, Get, Patch, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('notifications')
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req: any, @Query('limit') limit?: number) {
    const parsedLimit = limit ? Math.min(50, Math.max(1, Number(limit))) : 20;
    return this.notificationsService.getUserNotifications(req.user._id, parsedLimit);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const unreadCount = await this.notificationsService.getUnreadCount(req.user._id);
    return { unreadCount };
  }

  @Patch(':id/read')
  async markRead(@Request() req: any, @Param('id') id: string) {
    const notification = await this.notificationsService.markAsRead(req.user._id, id);
    return { success: true, notification };
  }

  @Post('mark-all-read')
  async markAllRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user._id);
  }
}
