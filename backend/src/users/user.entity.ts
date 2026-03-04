import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Event } from '../events/event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents: Event[];

  @ManyToMany(() => Event, (event) => event.participants)
  participatedEvents: Event[];

  @CreateDateColumn()
  createdAt: Date;
}
