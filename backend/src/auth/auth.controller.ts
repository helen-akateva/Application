import {
  Controller,
  Post,
  Get,
  Body,
  UsePipes,
  Res,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { registerSchema } from './schemas/register.schema';
import { loginSchema } from './schemas/login.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or User exists' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @UsePipes(new YupValidationPipe(registerSchema))
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Create new user and get their token
    const { token, user } = await this.authService.register(dto);
    // Save token in secure HTTP-only cookie
    this.setTokenCookie(res, token);
    return { message: 'User registered successfully', user };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UsePipes(new YupValidationPipe(loginSchema))
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Check credentials and get token
    const { token, user } = await this.authService.login(dto);
    // Save token in cookie to keep user logged in
    this.setTokenCookie(res, token);
    return { message: 'Logged in successfully', user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getMe(@Request() req: RequestWithUser) {
    return this.authService.getMe(req.user.sub);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(@Res({ passthrough: true }) res: Response) {
    // Delete the token cookie to log user out
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  private setTokenCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
