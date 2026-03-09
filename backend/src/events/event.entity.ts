import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';

export const EVENT_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;

export type EventVisibility =
  (typeof EVENT_VISIBILITY)[keyof typeof EVENT_VISIBILITY];

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  date: Date;

  @Column()
  location: string;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ type: 'varchar', default: EVENT_VISIBILITY.PUBLIC })
  visibility: EventVisibility;

  @ManyToOne(() => User, (user) => user.organizedEvents, { eager: true })
  organizer: User;

  @ManyToMany(() => User, (user) => user.participatedEvents)
  @JoinTable({ name: 'participants' })
  participants: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
