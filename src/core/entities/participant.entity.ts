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
import { Status } from '../enums';
import { Meeting } from './meeting.entity';
import { CCU } from './ccu.entity';

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

  @ManyToOne(() => Meeting, (meeting) => meeting.participants)
  meeting: Meeting;

  @ManyToOne(() => CCU, (ccu) => ccu.participant, {
    eager: true,
    cascade: true,
  })
  @Index()
  ccu: CCU;

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
