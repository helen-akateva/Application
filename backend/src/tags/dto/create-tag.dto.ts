import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Tech' })
  name: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  color?: string;
}
