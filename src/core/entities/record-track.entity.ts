import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Relation,
  Column,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Record } from './record.entity';
import { Participant } from './participant.entity';
import { User } from '..';

@Entity({ name: 'record-tracks' })
export class RecordTrack extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Record, (record) => record.track)
  record: Relation<Record>;

  @ApiProperty()
  @Transform(({ value }) => undefined)
  @Column({ type: String })
  urlToVideo: string;

  @ApiProperty()
  @Transform(({ value }) => undefined)
  @Column({ type: String })
  startTime: string;

  @ApiProperty()
  @Transform(({ value }) => undefined)
  @Column({ type: String })
  endTime: string;

  @ManyToOne(() => User, (user) => user.track)
  user: Relation<User>;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
