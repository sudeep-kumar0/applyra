import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      request.user = null;
      request.supabaseUser = null;
      return true;
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer === 'Bearer' && token) {
      try {
        const supabaseUser = await this.supabaseService.verifyToken(token);
        if (supabaseUser) {
          const mongoUser = await this.usersService.syncSupabaseUser(
            supabaseUser.id,
            supabaseUser.email || '',
          );
          request.supabaseUser = supabaseUser;
          request.user = mongoUser;
        }
      } catch {
        request.user = null;
        request.supabaseUser = null;
      }
    }

    return true;
  }
}
