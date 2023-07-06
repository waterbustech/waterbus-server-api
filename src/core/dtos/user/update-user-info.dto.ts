import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserInfoDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  avatar: string;
}
