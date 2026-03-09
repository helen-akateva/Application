import {
  Injectable,
  UnauthorizedException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import {
  JwtPayload,
  RequestWithUser,
} from '../../common/interfaces/request-with-user.interface';

type CookieJar = Readonly<Record<string, string>>;

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload: unknown = await this.jwtService.verifyAsync(token);
      if (!isJwtPayload(payload)) {
        throw new UnauthorizedException('Invalid token payload');
      }
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: RequestWithUser): string | undefined {
    const cookies: unknown = request.cookies;
    if (isCookieJar(cookies)) {
      const cookieToken = cookies['access_token'];
      if (cookieToken) return cookieToken;
    }

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const parts = authHeader.split(' ');
      return parts[1] ?? undefined;
    }

    return undefined;
  }
}

function isJwtPayload(value: unknown): value is JwtPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sub' in value &&
    'email' in value &&
    typeof (value as Record<string, unknown>)['sub'] === 'number' &&
    typeof (value as Record<string, unknown>)['email'] === 'string'
  );
}

function isCookieJar(value: unknown): value is CookieJar {
  return typeof value === 'object' && value !== null;
}
