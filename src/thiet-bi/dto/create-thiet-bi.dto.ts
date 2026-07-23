import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateThietBiDto {
  @ApiPropertyOptional({ description: 'Tên thiết bị' })
  @IsOptional()
  @IsString()
  tenThietBi?: string;

  @ApiPropertyOptional({ description: 'Loại thiết bị' })
  @IsOptional()
  @IsString()
  loai?: string;

  @ApiPropertyOptional({ description: 'Trạng thái' })
  @IsOptional()
  @IsInt()
  trangThai?: number;
}

export class UpdateThietBiDto extends PartialType(CreateThietBiDto) {}