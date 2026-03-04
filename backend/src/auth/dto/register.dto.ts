import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Електронна пошта користувача',
  })
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Пароль (мінімум 8 символів)',
    minLength: 8,
  })
  password: string;

  @ApiProperty({
    example: 'Ivan Ivanov',
    description: 'Повне ім’я користувача',
  })
  name: string;
}
