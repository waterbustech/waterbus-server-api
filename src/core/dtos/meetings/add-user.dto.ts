import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddUserDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  userId;
}
