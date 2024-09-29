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

export interface PaintModel {
  color: string;
  offsets: { dx: number; dy: number };
  width: number;
}

@Entity({ name: 'white-boards' })
export class WhiteBoard extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Meeting, (meeting) => meeting.whiteBoard)
  meeting: Relation<Meeting>;

  @ApiProperty()
  @Transform(({ value }) => undefined)
  @Column({ type: 'simple-json', default: [] })
  paints: PaintModel[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
