import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export interface IPagination {
  skip: number;
  limit: number;
}

export class PaginationListQuery implements IPagination {
  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  readonly skip: number = 0;

  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  readonly limit: number = 5;

  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  readonly page: number = 1;

  @ApiProperty({ required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  readonly perPage: number = 10;
}
