import { ApiProperty } from '@nestjs/swagger';

export class AskAiDto {
  @ApiProperty({ example: 'What events am I attending this week?' })
  question: string;
}
