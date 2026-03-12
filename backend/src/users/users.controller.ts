import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/events')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current user events' })
  @ApiResponse({
    status: 200,
    description: 'List of user events (as organizer or participant)',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getMyEvents(@Request() req: RequestWithUser) {
    // Return all events where the current user is an organizer or participant
    return this.usersService.getUserEvents(req.user.sub);
  }
}
