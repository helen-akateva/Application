import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-auth.guard';

interface RequestWithOptionalUser extends Request {
    user?: JwtPayload;
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<RequestWithOptionalUser>();
        const token = this.extractToken(request);

        if (token) {
            try {
                const payload: JwtPayload =
                    await this.jwtService.verifyAsync(token);
                request.user = payload;
            } catch (err: unknown) {
                // Token is invalid - ignore it, no user is attached
            }
        }

        return true; // Always allow request
    }

    private extractToken(request: RequestWithOptionalUser): string | undefined {
        const cookies = request.cookies as Record<string, string> | undefined;
        const cookieToken = cookies?.['access_token'];
        if (cookieToken) return cookieToken;

        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }

        return undefined;
    }
}
