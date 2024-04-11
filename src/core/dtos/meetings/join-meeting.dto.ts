import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JoinMeetingDto {
  @ApiProperty()
  @IsString()
  password: string;
}
