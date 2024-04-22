import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({type: String})
  @IsString()
  @IsNotEmpty()
  data;
}
