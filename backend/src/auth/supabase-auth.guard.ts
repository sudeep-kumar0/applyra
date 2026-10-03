import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format. Bearer <token> required');
    }

    const supabaseUser = await this.supabaseService.verifyToken(token);
    if (!supabaseUser) {
      throw new UnauthorizedException('Invalid or expired Supabase authentication session');
    }

    // Resolve or sync user in MongoDB
    const mongoUser = await this.usersService.syncSupabaseUser(
      supabaseUser.id,
      supabaseUser.email || '',
    );

    request.supabaseUser = supabaseUser;
    request.user = mongoUser;

    return true;
  }
}
