import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import { Meeting } from './meeting.entity';
import { Status } from '../enums';
import { MessageType } from '../enums/message';
import { User } from './user.entity';

@Entity({ name: 'messages' })
export class Message extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Hi there!' })
  @Column({ type: String })
  data: string;

  @ManyToOne(() => User, (user) => user.message, {
    eager: true,
    cascade: true,
  })
  @Index()
  createdBy: User;

  @ManyToOne(() => Meeting, (meeting) => meeting.message)
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
