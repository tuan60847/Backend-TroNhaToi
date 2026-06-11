import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSuaChuaDto {
  @ApiPropertyOptional({ description: 'ID phòng' })
  @IsOptional()
  @IsInt()
  phongId?: number;

  @ApiPropertyOptional({ description: 'Nguyên nhân' })
  @IsOptional()
  @IsString()
  nguyenNhan?: string;

  @ApiPropertyOptional({ description: 'Ngày sửa chữa (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngaySuaChua?: string;

}

export class UpdateSuaChuaDto extends PartialType(CreateSuaChuaDto) {}