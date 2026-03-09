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
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { createEventSchema } from './schemas/create-event.schema';
import { updateEventSchema } from './schemas/update-event.schema';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all public events' })
  @ApiResponse({ status: 200, description: 'List of public events' })
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get event by id' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 403, description: 'No access to private event' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: Partial<RequestWithUser>,
  ) {
    return this.eventsService.findOne(+id, req.user?.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @UsePipes(new YupValidationPipe(createEventSchema))
  async create(@Body() dto: CreateEventDto, @Request() req: RequestWithUser) {
    return this.eventsService.create(dto, req.user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not the organizer' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @UsePipes(new YupValidationPipe(updateEventSchema))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @Request() req: RequestWithUser,
  ) {
    return this.eventsService.update(+id, dto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not the organizer' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.eventsService.remove(+id, req.user.sub);
  }

  @Post(':id/join')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Join event' })
  @ApiResponse({ status: 200, description: 'Successfully joined' })
  @ApiResponse({
    status: 400,
    description: 'Already joined / Event is full / Organizer cannot join',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async join(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.eventsService.join(+id, req.user.sub);
  }

  @Post(':id/leave')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Leave event' })
  @ApiResponse({ status: 200, description: 'Successfully left the event' })
  @ApiResponse({ status: 400, description: 'Not a participant' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async leave(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.eventsService.leave(+id, req.user.sub);
  }
}
