import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Електронна пошта',
  })
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Пароль користувача',
  })
  password: string;
}
