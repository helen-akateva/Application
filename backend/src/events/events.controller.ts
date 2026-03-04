import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { createEventSchema } from './schemas/create-event.schema';
import { updateEventSchema } from './schemas/update-event.schema';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all public events' })
  async findAll(@Request() req: { user?: { sub: number } }) {
    return this.eventsService.findAll(req.user?.sub);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get event by id' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user?: { sub: number } },
  ) {
    return this.eventsService.findOne(+id, req.user?.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create new event' })
  @UsePipes(new YupValidationPipe(createEventSchema))
  async create(
    @Body() dto: CreateEventDto,
    @Request() req: { user: { sub: number } },
  ) {
    return this.eventsService.create(dto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update event' })
  @UsePipes(new YupValidationPipe(updateEventSchema))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Request() req: { user: { sub: number } },
  ) {
    return this.eventsService.update(+id, dto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete event' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { sub: number } },
  ) {
    return this.eventsService.remove(+id, req.user.sub);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Join event' })
  async join(
    @Param('id') id: string,
    @Request() req: { user: { sub: number } },
  ) {
    return this.eventsService.join(+id, req.user.sub);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Leave event' })
  async leave(
    @Param('id') id: string,
    @Request() req: { user: { sub: number } },
  ) {
    return this.eventsService.leave(+id, req.user.sub);
  }
}
