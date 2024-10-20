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
import { Meeting } from './meeting.entity';
import { ApiProperty } from '@nestjs/swagger';

export interface PaintModel {
  color: string;
  offsets: OffsetModel[];
  width: number;
  poligonSides: number;
  isFilled: boolean;
  type: string;
  createdAt: string;
}

export interface OffsetModel {
  dx: number;
  dy: number;
}

@Entity({ name: 'white-boards' })
export class WhiteBoard extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Meeting, (meeting) => meeting.whiteBoard)
  meeting: Relation<Meeting>;

  @ApiProperty()
  @Column({ type: 'simple-json', default: [] })
  paints: PaintModel[];

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
