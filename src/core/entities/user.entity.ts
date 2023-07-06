import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';

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

  @BeforeInsert()
  async generateUserName() {
    // Convert full name to lowercase
    const lowercaseName = this.fullName.toLowerCase();

    // Remove spaces from the name
    const nameWithoutSpaces = lowercaseName.replace(/\s/g, '');

    // Add a unique identifier to the name (e.g., timestamp)
    const uniqueIdentifier = Date.now().toString();

    // Combine the name and unique identifier to generate the username
    this.userName = `${nameWithoutSpaces}${uniqueIdentifier}`;
  }
}
