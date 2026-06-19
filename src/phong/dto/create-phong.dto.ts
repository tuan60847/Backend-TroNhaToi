import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePhongDto {
  @ApiPropertyOptional({ description: 'Tên phòng' })
  @IsOptional()
  @IsString()
  tenPhong?: string;

  @ApiPropertyOptional({ description: 'Trạng thái (0: trống, ...)' })
  @IsOptional()
  @IsInt()
  trangThai?: number;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiPropertyOptional({ description: 'Mã loại phòng' })
  @IsOptional()
  @IsInt()
  maLoaiPhong?: number;

}

export class UpdatePhongDto extends PartialType(CreatePhongDto) {}