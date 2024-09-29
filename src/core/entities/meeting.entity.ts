import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import bcrypt from 'bcryptjs';
import { Participant } from './participant.entity';
import { Transform } from 'class-transformer';
import { Message } from './message.entity';
import { Member } from './member.entity';
import { customAlphabet } from 'nanoid';
import { MeetingStatus } from '../enums/meeting';
import { WhiteBoard } from './white-board.entity';

@Entity({ name: 'meetings' })
export class Meeting extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Meeting with Kai' })
  @Column({ type: String })
  title: string;

  @ApiProperty()
  @Transform(({ value }) => undefined)
  @Column({ type: String })
  password: string;

  // Use for session join
  @OneToMany(() => Participant, (participant) => participant.meeting, {
    eager: true,
    cascade: true,
  })
  participants: Relation<Participant[]>;

  // Permanent access
  @OneToMany(() => Member, (member) => member.meeting, {
    eager: true,
    cascade: true,
  })
  members: Relation<Member[]>;

  @OneToOne(() => Message, (message) => message.meeting, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  latestMessage: Relation<Message>;

  @OneToMany(() => Message, (message) => message.meeting)
  message: Relation<Message>;

  @OneToMany(() => WhiteBoard, (whiteBoard) => whiteBoard.meeting)
  whiteBoard: Relation<WhiteBoard>;

  @Column({
    type: 'enum',
    enum: MeetingStatus,
    default: MeetingStatus.Active,
  })
  status: MeetingStatus;

  @Column({ type: Date, nullable: true })
  latestMessageCreatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Column({ type: Number })
  code: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  async generateCode() {
    let id = '';
    const generateID = customAlphabet('1234567890', 9);

    while (id.length !== 9 || id.startsWith('0')) {
      id = generateID();
    }

    this.code = Number(id);
  }

  @BeforeUpdate()
  async updateLatestMessageCreatedAt() {
    if (this.latestMessage) {
      this.latestMessageCreatedAt = this.latestMessage.createdAt;
    }
  }
}
