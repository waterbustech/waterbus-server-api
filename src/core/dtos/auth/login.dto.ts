import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginSocialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  googleId: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  facebookId: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  appleId: string;
}
