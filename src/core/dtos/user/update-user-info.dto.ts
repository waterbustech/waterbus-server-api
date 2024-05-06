import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserInfoDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  bio: string;

  @IsOptional()
  @IsString()
  avatar: string;
}
