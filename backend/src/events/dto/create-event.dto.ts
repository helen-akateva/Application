import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EVENT_VISIBILITY } from '../event.entity';
import type { EventVisibility } from '../event.entity';

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

  @ApiProperty({
    example: EVENT_VISIBILITY.PUBLIC,
    enum: Object.values(EVENT_VISIBILITY),
  })
  visibility: EventVisibility;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  tagIds?: number[];
}
