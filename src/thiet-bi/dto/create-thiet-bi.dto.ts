import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Giá trị' })
  @IsOptional()
  @IsNumber()
  giaTri?: number;

  @ApiPropertyOptional({ description: 'Ngày mua (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayMua?: string;

  @ApiPropertyOptional({ description: 'Trạng thái' })
  @IsOptional()
  @IsString()
  trangThai?: string;

}

export class UpdateThietBiDto extends PartialType(CreateThietBiDto) {}