import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class JoinMeetingDto {
  @ApiProperty()
  @IsString()
  password: string;
}
