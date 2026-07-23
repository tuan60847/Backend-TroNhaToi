import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateNguoiLuuTruTamThoiDto {
  @ApiProperty({ description: 'ID người thuê bảo lãnh' })
  @IsInt()
  @IsNotEmpty()
  IDNT: number;

  @ApiPropertyOptional({ description: 'ID phòng lưu trú' })
  @IsOptional()
  @IsInt()
  phongId?: number;

  @ApiPropertyOptional({ description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  hoTen?: string;

  @ApiPropertyOptional({ description: 'Mối quan hệ (Ba, mẹ, anh, chị, bạn...)' })
  @IsOptional()
  @IsString()
  moiQuanHe?: string;

  @ApiPropertyOptional({ description: 'Số CCCD/CMND' })
  @IsOptional()
  @IsString()
  cccd?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  sdt?: string;

  @ApiPropertyOptional({ description: 'Ngày đến (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayDen?: string;

  @ApiPropertyOptional({ description: 'Ngày về (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  ngayVe?: string;

}

export class UpdateNguoiLuuTruTamThoiDto extends PartialType(CreateNguoiLuuTruTamThoiDto) {}