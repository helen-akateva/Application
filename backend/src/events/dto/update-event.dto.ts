import { ApiPropertyOptional } from '@nestjs/swagger';
import { EVENT_VISIBILITY } from '../event.entity';
import type { EventVisibility } from '../event.entity';

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

  @ApiPropertyOptional({
    example: EVENT_VISIBILITY.PUBLIC,
    enum: Object.values(EVENT_VISIBILITY),
  })
  visibility?: EventVisibility;
  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  tagIds?: number[];
}
