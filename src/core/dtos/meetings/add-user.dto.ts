import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddUserDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId;
}
