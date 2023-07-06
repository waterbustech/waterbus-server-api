import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginSocialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  googleId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  facebookId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  appleId: string;
}
