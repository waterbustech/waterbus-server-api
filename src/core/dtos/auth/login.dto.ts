import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginSocialDto {
  @ApiProperty({ example: 'Kai Dao' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ nullable: true, example: 'lambiengcode', required: false })
  @IsString()
  @IsOptional()
  googleId: string;

  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  githubId: string;

  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  appleId: string;
}
