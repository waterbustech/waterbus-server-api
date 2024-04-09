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
import { Meeting } from './meeting.entity';
import { MemberRole, MemberStatus } from '../enums/member';

@Entity({ name: 'members' })
export class Member extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.participant, {
    eager: true,
    cascade: true,
  })
  @Index()
  user: User;

  @ManyToOne(() => Meeting, (meeting) => meeting.members)
  meeting: Meeting;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.Attendee,
  })
  role: MemberRole;

  @Column({
    type: 'enum',
    enum: MemberStatus,
    default: MemberStatus.Inviting,
  })
  status: MemberStatus;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
