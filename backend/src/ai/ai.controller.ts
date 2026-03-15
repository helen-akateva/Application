import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';
import { askAiSchema } from './schemas/ask-ai.schema';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Ask AI assistant about your events' })
  async ask(
    @Body(new YupValidationPipe(askAiSchema)) dto: AskAiDto,
    @Request() req: RequestWithUser,
  ): Promise<{ answer: string }> {
    const answer = await this.aiService.ask(dto.question, req.user.sub);
    return { answer };
  }
}
