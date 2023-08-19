import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { User } from '..';
import { ParticipantRole } from '../enums';
import { Meeting } from './meeting.entity';

@Entity()
export class Participant extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    eager: false,
  })
  @Index()
  user: User;

  @ManyToOne(() => Meeting, (meeting) => meeting.users)
  meeting: Meeting;

  @Column({
    type: 'enum',
    enum: ParticipantRole,
    default: ParticipantRole.Attendee,
  })
  role: ParticipantRole;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
