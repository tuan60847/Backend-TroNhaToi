import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePhongDto {

  @ApiPropertyOptional({ description: 'ID Phòng' })
  @IsOptional()
  @IsInt()
  phongId?: number;

  @ApiPropertyOptional({ description: 'Tên phòng' })
  @IsOptional()
  @IsString()
  tenPhong?: string;

  @ApiPropertyOptional({ description: 'Trạng thái (trong/dangThue/suaChua)' })
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