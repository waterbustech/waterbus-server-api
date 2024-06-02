import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class OauthDto {
  @ApiProperty({ example: 'code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'client-id' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'redirect_uri' })
  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}
