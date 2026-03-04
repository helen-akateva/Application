import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Tech Conference 2026 Updated' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;

  @ApiPropertyOptional({ example: '2026-03-10T10:00:00.000Z' })
  date?: string;

  @ApiPropertyOptional({ example: 'Kyiv, Ukraine' })
  location?: string;

  @ApiPropertyOptional({ example: 50 })
  capacity?: number;

  @ApiPropertyOptional({ example: 'public', enum: ['public', 'private'] })
  visibility?: string;
}
