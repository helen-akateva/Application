import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Event } from '../events/event.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    transformer: {
      to: (value: string) => value?.toLowerCase().trim(),
      from: (value: string) => value,
    },
  })
  name: string;

  @Column({ nullable: true })
  color: string;

  @ManyToMany(() => Event, (event) => event.tags)
  events: Event[];
}
