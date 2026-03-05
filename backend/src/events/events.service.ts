import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findAll(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { visibility: 'public' },
      relations: ['organizer', 'participants'],
    });
  }

  async findOne(id: number, userId?: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'participants'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.visibility === 'private') {
      // Must be logged in to see private events
      if (!userId) {
        throw new ForbiddenException('Please login to view this event');
      }

      // Check if user is organizer or already joined
      const isRelated =
        event.organizer.id === userId ||
        event.participants.some((p) => p.id === userId);
      if (!isRelated) {
        throw new ForbiddenException('You do not have access to this event');
      }
    }
    return event;
  }

  async create(dto: CreateEventDto, userId: number): Promise<Event> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const event = this.eventsRepository.create({
      ...dto,
      date: new Date(dto.date),
      organizer: user,
    });

    return this.eventsRepository.save(event);
  }

  async update(
    id: number,
    dto: UpdateEventDto,
    userId: number,
  ): Promise<Event> {
    const event = await this.findOne(id);

    if (event.organizer.id !== userId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }

    if (dto.capacity !== undefined) {
      const participantsCount = event.participants.length;
      if (dto.capacity < participantsCount) {
        throw new BadRequestException(
          `Capacity cannot be less than current participants count (${participantsCount})`,
        );
      }
    }

    Object.assign(event, {
      ...dto,
      date: dto.date ? new Date(dto.date) : event.date,
    });

    return this.eventsRepository.save(event);
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const event = await this.findOne(id);

    if (event.organizer.id !== userId) {
      throw new ForbiddenException('You are not the organizer of this event');
    }

    await this.eventsRepository.remove(event);
    return { message: 'Event deleted successfully' };
  }

  async join(eventId: number, userId: number): Promise<{ message: string }> {
    const event = await this.findOne(eventId);
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is the organizer
    if (event.organizer.id === userId) {
      throw new BadRequestException('Organizer cannot join their own event');
    }

    // Check if user already joined
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
    const event = await this.findOne(eventId);

    // Check if user is actually in the event
    const isJoined = event.participants.some((p) => p.id === userId);
    if (!isJoined) {
      throw new BadRequestException('You are not a participant of this event');
    }

    // Remove user from the participants list
    event.participants = event.participants.filter((p) => p.id !== userId);
    await this.eventsRepository.save(event);
    return { message: 'Successfully left the event' };
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    // Find all events where user is organizer OR participant
    return this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.participants', 'participants')
      .where('organizer.id = :userId', { userId })
      .orWhere('participants.id = :userId', { userId })
      .getMany();
  }
}
