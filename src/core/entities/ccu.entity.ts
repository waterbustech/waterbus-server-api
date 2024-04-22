import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import { User } from '..';
import { Participant } from './participant.entity';

@Entity({ name: 'ccus' })
export class CCU extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'socket.io.client.id.waterbus' })
  @Column({ type: String })
  socketId: string;

  @ApiProperty({ example: 'WS-SFU-01' })
  @Column({ type: String })
  podName: string;

  @ManyToOne(() => User, (user) => user.participant, {
    eager: true,
    cascade: true,
  })
  @Index()
  user: Relation<User>;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Participant, (ccu) => ccu.ccu)
  participant: Relation<Participant>;
}
