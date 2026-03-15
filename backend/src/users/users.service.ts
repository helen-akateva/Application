import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import type { Event } from '../events/event.entity';

@Injectable()
export class UsersService {
  constructor(private readonly eventsService: EventsService) {}

  async getUserEvents(userId: number): Promise<Event[]> {
    return this.eventsService.getUserEvents(userId);
  }
}
