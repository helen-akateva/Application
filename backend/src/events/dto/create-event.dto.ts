import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2026' })
  title: string;

  @ApiPropertyOptional({ example: 'Annual tech conference' })
  description?: string;

  @ApiProperty({ example: '2026-03-10T10:00:00.000Z' })
  date: string;

  @ApiProperty({ example: 'Kyiv, Ukraine' })
  location: string;

  @ApiPropertyOptional({ example: 100 })
  capacity?: number;

  @ApiProperty({ example: 'public', enum: ['public', 'private'] })
  visibility: string;
}
