import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EVENT_VISIBILITY } from './event.entity';
import { User } from '../users/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { TagsService } from '../tags/tags.service';

function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...safe } = user as User & { password?: string };
  void password;
  return safe as Omit<User, 'password'>;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private tagsService: TagsService,
  ) {}

  async findAll(tagIds?: number[]) {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.tags', 'tags')
      .where('event.visibility = :visibility', {
        visibility: EVENT_VISIBILITY.PUBLIC,
      });

    if (tagIds && tagIds.length > 0) {
      // Filter events that have ANY of the provided tags
      query.andWhere(
        (qb) =>
          'event.id IN ' +
          qb
            .subQuery()
            .select('ev.id')
            .from('events', 'ev')
            .innerJoin('ev.tags', 't')
            .where('t.id IN (:...tagIds)')
            .getQuery(),
        { tagIds },
      );
    }

    const events = await query.getMany();

    return events.map(({ participants, organizer, ...event }) => ({
      ...event,
      organizer: sanitizeUser(organizer) as User,
      participants: (participants || []).map((p) => sanitizeUser(p) as User),
      participantsCount: participants?.length || 0,
    }));
  }

  async findOne(id: number, userId?: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants', 'tags'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.visibility === EVENT_VISIBILITY.PRIVATE) {
      if (!userId) {
        throw new ForbiddenException('Please login to view this event');
      }

      const isRelated =
        event.organizer.id === userId ||
        event.participants.some((p) => p.id === userId);

      if (!isRelated) {
        throw new ForbiddenException('You do not have access to this event');
      }
    }

    event.organizer = sanitizeUser(event.organizer) as User;
    event.participants = event.participants.map((p) => sanitizeUser(p) as User);

    return event;
  }

  async create(dto: CreateEventDto, userId: number): Promise<Event> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.tagIds && dto.tagIds.length > 5) {
      throw new BadRequestException('Maximum 5 tags allowed');
    }

    const eventDate = new Date(dto.date);
    if (eventDate < new Date()) {
      throw new BadRequestException('Cannot create events in the past');
    }

    const tags = dto.tagIds?.length
      ? await this.tagsService.findByIds(dto.tagIds)
      : [];

    const event = this.eventsRepository.create({
      ...dto,
      date: eventDate,
      organizer: user,
      tags,
    });

    const saved = await this.eventsRepository.save(event);
    saved.organizer = sanitizeUser(saved.organizer) as User;
    return saved;
  }

  async update(
    id: number,
    dto: UpdateEventDto,
    userId: number,
  ): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants', 'tags'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizer.id !== userId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }

    if (dto.tagIds && dto.tagIds.length > 5) {
      throw new BadRequestException('Maximum 5 tags allowed');
    }

    if (dto.capacity !== undefined) {
      const participantsCount = event.participants.length;
      if (dto.capacity < participantsCount) {
        throw new BadRequestException(
          `Capacity cannot be less than current participants count (${participantsCount})`,
        );
      }
    }

    if (dto.tagIds !== undefined) {
      event.tags = dto.tagIds.length
        ? await this.tagsService.findByIds(dto.tagIds)
        : [];
    }

    Object.assign(event, {
      ...dto,
      date: dto.date ? new Date(dto.date) : event.date,
    });

    const saved = await this.eventsRepository.save(event);
    saved.organizer = sanitizeUser(saved.organizer) as User;
    saved.participants = saved.participants.map((p) => sanitizeUser(p) as User);
    return saved;
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizer.id !== userId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }
    if (new Date(event.date) < new Date()) {
      throw new BadRequestException('Cannot edit a past event');
    }
    await this.eventsRepository.remove(event);
    return { message: 'Event deleted successfully' };
  }

  async join(eventId: number, userId: number): Promise<{ message: string }> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['organizer', 'participants'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (new Date(event.date) < new Date()) {
      throw new BadRequestException('Cannot join a past event');
    }
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (event.organizer.id === userId) {
      throw new BadRequestException('Organizer cannot join their own event');
    }

    const isAlreadyJoined = event.participants.some((p) => p.id === userId);
    if (isAlreadyJoined) {
      throw new BadRequestException('You are already joined this event');
    }

    if (event.capacity && event.participants.length >= event.capacity) {
      throw new BadRequestException('Event is full');
    }

    event.participants.push(user);
    await this.eventsRepository.save(event);
    return { message: 'Successfully joined the event' };
  }

  async leave(eventId: number, userId: number): Promise<{ message: string }> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['participants'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const isJoined = event.participants.some((p) => p.id === userId);
    if (!isJoined) {
      throw new BadRequestException('You are not a participant of this event');
    }

    event.participants = event.participants.filter((p) => p.id !== userId);
    await this.eventsRepository.save(event);
    return { message: 'Successfully left the event' };
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    const events = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.tags', 'tags')
      .where('organizer.id = :userId OR participants.id = :userId', { userId })
      .getMany();

    return events.map((event) => ({
      ...event,
      organizer: sanitizeUser(event.organizer) as User,
      participants: (event.participants || []).map(
        (p) => sanitizeUser(p) as User,
      ),
      participantsCount: event.participants?.length || 0,
    })) as Event[];
  }
}
