import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as yup from 'yup';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { registerSchema } from './schemas/register.schema';
import { loginSchema } from './schemas/login.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      await registerSchema.validate(dto, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new BadRequestException(error.errors);
      }
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    await this.usersRepository.save(user);

    return { message: 'User registered successfully' };
  }

  async login(dto: LoginDto) {
    try {
      await loginSchema.validate(dto, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new BadRequestException(error.errors);
      }
    }

    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
