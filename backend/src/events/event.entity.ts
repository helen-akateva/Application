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

  @Column({ nullable: true })
  capacity: number;

  @Column({ default: 'public' })
  visibility: string;

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
