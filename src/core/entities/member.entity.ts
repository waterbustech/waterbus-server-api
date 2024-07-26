import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  Index,
  Relation,
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
  user: Relation<User>;

  @ManyToOne(() => Meeting, (meeting) => meeting.members)
  meeting: Relation<Meeting>;

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

  @Column({
    type: Date,
    nullable: true,
  })
  softDeletedAt: Date;
}
