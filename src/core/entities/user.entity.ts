import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import { Participant } from './participant.entity';
import { Message } from './message.entity';
import { nanoid } from 'nanoid';
import { Record } from './record.entity';

@Entity({ name: 'users' })
export class User extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Kai Dao' })
  @Column({ type: String, nullable: true })
  fullName?: string;

  @Column({ type: String, unique: true, nullable: false })
  userName?: string;

  @ApiProperty({ example: 'I am a software engineer' })
  @Column({ type: String, nullable: true })
  bio?: string;

  @ApiProperty({ example: 'googleId' })
  @Column({ type: String, unique: true, nullable: true })
  googleId?: string;

  @Column({ type: String, unique: true, nullable: true })
  githubId?: string;

  @Column({ type: String, unique: true, nullable: true })
  appleId?: string;

  @ApiProperty({ example: 'https://waterbus.cloud/assets/avatar/lambiengcode' })
  @Column({ type: String, nullable: true })
  avatar?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @DeleteDateColumn()
  lastSeenAt: Date;

  @OneToMany(() => Participant, (participant) => participant.user)
  participant: Relation<Participant>;

  @OneToMany(() => Message, (message) => message.createdBy)
  message: Relation<Message>;

  @OneToMany(() => Record, (record) => record.createdBy)
  record: Relation<Record>;

  @BeforeInsert()
  async generateUserName() {
    this.userName = nanoid(12);
  }
}
