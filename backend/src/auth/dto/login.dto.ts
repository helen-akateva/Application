import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password',
  })
  password: string;
}
