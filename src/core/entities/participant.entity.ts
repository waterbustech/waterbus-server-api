import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { User } from '..';
import { ParticipantRole, Status } from '../enums';
import { Meeting } from './meeting.entity';

@Entity({ name: 'participants' })
export class Participant extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.participant, {
    eager: true,
    cascade: true,
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

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
