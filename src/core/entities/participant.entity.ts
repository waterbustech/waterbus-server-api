import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  Index,
  Relation,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { User } from '..';
import { Status } from '../enums';
import { Meeting } from './meeting.entity';
import { CCU } from './ccu.entity';
import { RecordTrack } from './record-track.entity';

@Entity({ name: 'participants' })
export class Participant extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.participant, {
    eager: true,
    cascade: true,
  })
  @Index()
  user: Relation<User>;

  @ManyToOne(() => Meeting, (meeting) => meeting.participants)
  meeting: Relation<Meeting>;

  @ManyToOne(() => CCU, (ccu) => ccu.participant, {
    eager: true,
    cascade: true,
  })
  @Index()
  ccu: Relation<CCU>;

  @OneToMany(() => RecordTrack, (track) => track.participant)
  track: Relation<RecordTrack>;

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
