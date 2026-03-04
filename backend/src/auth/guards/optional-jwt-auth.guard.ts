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
            } catch {
                // Токен невалідний — ігноруємо, просто немає юзера
            }
        }

        return true; // Завжди пропускаємо запит
    }

    private extractToken(request: RequestWithOptionalUser): string | undefined {
        const cookieToken = request.cookies?.['access_token'] as string | undefined;
        if (cookieToken) return cookieToken;

        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }

        return undefined;
    }
}
