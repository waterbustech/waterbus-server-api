import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  Relation,
  Column,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Meeting } from './meeting.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { RecordTrack } from './record-track.entity';
import { User } from './user.entity';
import { RecordStatus } from '../enums';

@Entity({ name: 'records' })
export class Record extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Meeting, (meeting) => meeting.message)
  meeting: Relation<Meeting>;

  @ManyToOne(() => User, (user) => user.record)
  @Index()
  createdBy: Relation<User>;

  @OneToMany(() => RecordTrack, (track) => track.record, {
    eager: true,
    cascade: true,
  })
  track: Relation<Meeting>;

  @ApiProperty()
  @Column({ type: String, default: null, nullable: true })
  urlToVideo: string;

  @ApiProperty()
  @Column({ type: String, default: null, nullable: true })
  thumbnail: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @Column({ type: Number, default: 0 })
  duration: number;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @Column({ type: 'enum', enum: RecordStatus, default: RecordStatus.Recording })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
