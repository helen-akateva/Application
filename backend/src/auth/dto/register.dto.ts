import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Password (min 8 characters)',
    minLength: 8,
  })
  password: string;

  @ApiProperty({
    example: 'Ivan Ivanov',
    description: 'User full name',
  })
  name: string;
}
