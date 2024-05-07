import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserInfoDto {
  @ApiProperty({ example: 'Kai Dao' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'Waterbus is an open source' })
  @IsString()
  @IsOptional()
  bio: string;

  @ApiProperty({example: 'https://image.png'})
  @IsOptional()
  @IsString()
  avatar: string;
}
