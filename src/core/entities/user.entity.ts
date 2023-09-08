import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import { Participant } from './participant.entity';

@Entity()
export class User extends EntityHelper {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Kai Dao' })
  @Column({ type: String, nullable: true })
  fullName?: string;

  @Column({ type: String, unique: true, nullable: false })
  userName?: string;

  @ApiProperty({ example: 'googleId' })
  @Column({ type: String, unique: true, nullable: true })
  googleId?: string;

  @ApiProperty({ example: 'facebookId' })
  @Column({ type: String, unique: true, nullable: true })
  facebookId?: string;

  @ApiProperty({ example: 'appleId' })
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

  @OneToMany(() => Participant, (participant) => participant.user)
  participant: Participant;

  @BeforeInsert()
  async generateUserName() {
    // Convert full name to lowercase
    const lowercaseName = this.fullName.toLowerCase();

    // Remove spaces and non-ASCII characters from the name
    const nameWithoutSpacesAndNonAscii = lowercaseName.replace(
      /[\s\u0080-\uFFFF]/g,
      '',
    );

    // Add a unique identifier to the name (e.g., timestamp)
    const uniqueIdentifier = Date.now().toString();

    // Combine the name and unique identifier to generate the username
    this.userName = `${nameWithoutSpacesAndNonAscii}${uniqueIdentifier}`;
  }
}
