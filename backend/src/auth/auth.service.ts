import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check for existing user
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Secure password hashing
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user entity
    const user = this.usersRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    const savedUser = await this.usersRepository.save(user);

    const payload = { sub: savedUser.id, email: savedUser.email };
    const token = this.jwtService.sign(payload);

    // Return token and user data without password
    return {
      token,
      user: { id: savedUser.id, email: savedUser.email, name: savedUser.name },
    };
  }

  async login(dto: LoginDto) {
    // Fetch user by email
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'name'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate credentials
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Issue authentication token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    // Return token and user data without password
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async getMe(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id, email: user.email, name: user.name };
  }
}
