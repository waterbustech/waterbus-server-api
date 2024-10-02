import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Relation,
  Column,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Meeting } from './meeting.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Record } from './record.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
