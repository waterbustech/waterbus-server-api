import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import { Meeting } from './meeting.entity';
import { Status } from '../enums';
import { MessageType } from '../enums/message';

@Entity({ name: 'messages' })
export class Message extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Hi there!' })
  @Column({ type: String })
  data: string;

  @ManyToOne(() => Meeting, (meeting) => meeting.participants)
  meeting: Meeting;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.Default,
  })
  type: MessageType;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Active,
  })
  status: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
